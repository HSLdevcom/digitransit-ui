import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { matchShape } from 'found';
import { graphql, fetchQuery } from 'react-relay';
import moment from 'moment';
import uniqBy from 'lodash/uniqBy';
import compact from 'lodash/compact';
import indexOf from 'lodash/indexOf';
import isEqual from 'lodash/isEqual';
import polyline from 'polyline-encoded';
import distance from '@digitransit-search-util/digitransit-search-util-distance';
import BackButton from '../BackButton';
import VehicleMarkerContainer from './VehicleMarkerContainer';
import Line from './Line';
import MapWithTracking from './MapWithTracking';
import {
  startRealTimeClient,
  stopRealTimeClient,
} from '../../action/realTimeClientAction';
import { addressToItinerarySearch } from '../../util/otpStrings';
import {
  sortNearbyRentalStations,
  sortNearbyStops,
} from '../../util/sortUtils';
import ItineraryLine from './ItineraryLine';
import { dtLocationShape, mapLayerOptionsShape } from '../../util/shapes';
import Loading from '../Loading';
import LazilyLoad, { importLazy } from '../LazilyLoad';
import { getDefaultNetworks } from '../../util/citybikes';

const locationMarkerModules = {
  LocationMarker: () =>
    importLazy(import(/* webpackChunkName: "map" */ './LocationMarker')),
};
const handleStopsAndStations = edges => {
  const terminalNames = [];
  const stopsAndStations = edges.map(({ node }) => {
    const stop = { ...node.place, distance: node.distance };
    if (
      stop.parentStation &&
      indexOf(terminalNames, stop.parentStation.name) === -1
    ) {
      terminalNames.push(stop.parentStation.name);
      return { ...stop.parentStation, distance: node.distance };
    }
    if (!stop.parentStation) {
      return stop;
    }
    return null;
  });
  return compact(stopsAndStations);
};

const startClient = (context, routes) => {
  const { realTime } = context.config;
  let agency;
  /* handle multiple feedid case */
  context.config.feedIds.forEach(ag => {
    if (!agency && realTime[ag]) {
      agency = ag;
    }
  });
  const source = agency && realTime[agency];
  if (source && source.active && routes.length > 0) {
    const config = {
      ...source,
      agency,
      options: routes,
    };
    context.executeAction(startRealTimeClient, config);
  }
};
const stopClient = context => {
  const { client } = context.getStore('RealTimeInformationStore');
  if (client) {
    context.executeAction(stopRealTimeClient, client);
  }
};

const handleBounds = (location, edges, breakpoint) => {
  if (edges.length === 0) {
    // No stops anywhere near
    return [
      [location.lat, location.lon],
      [location.lat, location.lon],
    ];
  }
  const nearestStop = edges[0].node.place;
  const bounds =
    breakpoint !== 'large'
      ? [
          [
            nearestStop.lat + (nearestStop.lat - location.lat) * 0.5,
            nearestStop.lon + (nearestStop.lon - location.lon) * 0.5,
          ],
          [
            location.lat + (location.lat - nearestStop.lat) * 0.5,
            location.lon + (location.lon - nearestStop.lon) * 0.5,
          ],
        ]
      : [
          [nearestStop.lat, nearestStop.lon],
          [
            location.lat + location.lat - nearestStop.lat,
            location.lon + location.lon - nearestStop.lon,
          ],
        ];
  return bounds;
};

const getLocationMarker = location => {
  return (
    <LazilyLoad modules={locationMarkerModules} key="from">
      {({ LocationMarker }) => (
        <LocationMarker position={location} type="from" />
      )}
    </LazilyLoad>
  );
};

function StopsNearYouMap(
  {
    breakpoint,
    currentTime,
    stopsNearYou,
    match,
    loading,
    favouriteIds,
    relay,
    position,
    onEndNavigation,
    onMapTracking,
    mapLayers,
    mapLayerOptions,
    showWalkRoute,
    prioritizedStopsNearYou,
  },
  { ...context },
) {
  const [sortedStopEdges, setSortedStopEdges] = useState([]);
  const [uniqueRealtimeTopics, setUniqueRealtimeTopics] = useState([]);
  const [routes, setRouteLines] = useState([]);
  const [bounds, setBounds] = useState([]);
  const [clientOn, setClientOn] = useState(false);
  const [firstPlan, setFirstPlan] = useState({
    itinerary: [],
    isFetching: false,
    stop: null,
  });
  const { mode } = match.params;
  const isTransitMode = mode !== 'CITYBIKE';
  const walkRoutingThreshold =
    mode === 'RAIL' || mode === 'SUBWAY' || mode === 'FERRY' ? 3000 : 1500;
  const { environment } = relay;
  const fetchPlan = stop => {
    const toPlace = {
      address: stop.name ? stop.name : 'stop',
      lon: stop.lon,
      lat: stop.lat,
    };
    const variables = {
      fromPlace: addressToItinerarySearch(position),
      toPlace: addressToItinerarySearch(toPlace),
      date: moment(currentTime * 1000).format('YYYY-MM-DD'),
      time: moment(currentTime * 1000).format('HH:mm:ss'),
    };
    const query = graphql`
      query StopsNearYouMapQuery(
        $fromPlace: String!
        $toPlace: String!
        $date: String!
        $time: String!
      ) {
        plan: plan(
          fromPlace: $fromPlace
          toPlace: $toPlace
          date: $date
          time: $time
          transportModes: [{ mode: WALK }]
        ) {
          itineraries {
            legs {
              mode
              ...ItineraryLine_legs
            }
          }
        }
      }
    `;
    if (stop.distance < walkRoutingThreshold) {
      fetchQuery(environment, query, variables).then(({ plan: result }) => {
        setFirstPlan({ itinerary: result, isFetching: false, stop });
      });
    } else {
      setFirstPlan({ itinerary: [], isFetching: false, stop });
    }
  };

  const handleWalkRoutes = stopsAndStations => {
    if (showWalkRoute) {
      if (stopsAndStations.length > 0) {
        const firstStop = stopsAndStations[0];
        const shouldFetchWalkRoute = () => {
          return (
            (mode !== 'BUS' && mode !== 'TRAM') ||
            favouriteIds.has(firstStop.gtfsId)
          );
        };
        if (!isEqual(firstStop, firstPlan.stop) && shouldFetchWalkRoute()) {
          setFirstPlan({
            itinerary: firstPlan.itinerary,
            isFetching: true,
            stop: firstStop,
          });
          fetchPlan(firstStop);
        } else if (!shouldFetchWalkRoute()) {
          setFirstPlan({
            itinerary: [],
            isFetching: false,
            stop: null,
          });
        }
      }
    } else {
      setFirstPlan({
        itinerary: [],
        isFetching: false,
        stop: null,
      });
    }
  };

  useEffect(() => {
    const newBounds = handleBounds(position, sortedStopEdges, breakpoint);
    if (newBounds.length > 0) {
      setBounds(newBounds);
    }
  }, [position, sortedStopEdges]);

  const setRoutes = sortedRoutes => {
    const routeLines = [];
    const realtimeTopics = [];
    sortedRoutes.forEach(item => {
      const { place } = item.node;
      // eslint-disable-next-line no-unused-expressions
      place.patterns &&
        place.patterns.forEach(pattern => {
          const feedId = pattern.route.gtfsId.split(':')[0];
          realtimeTopics.push({
            feedId,
            route: pattern.route.gtfsId.split(':')[1],
            shortName: pattern.route.shortName,
          });
          routeLines.push(pattern);
        });
      // eslint-disable-next-line no-unused-expressions
      place.stops &&
        place.stops.forEach(stop => {
          stop.patterns.forEach(pattern => {
            const feedId = pattern.route.gtfsId.split(':')[0];
            realtimeTopics.push({
              feedId,
              route: pattern.route.gtfsId.split(':')[1],
              shortName: pattern.route.shortName,
            });
            routeLines.push(pattern);
          });
        });
    });

    setRouteLines(routeLines);
    if (!clientOn) {
      setUniqueRealtimeTopics(uniqBy(realtimeTopics, route => route.route));
    }
  };

  useEffect(() => {
    if (uniqueRealtimeTopics.length > 0 && !clientOn) {
      startClient(context, uniqueRealtimeTopics);
      setClientOn(true);
    }
    return function cleanup() {
      stopClient(context);
    };
  }, [uniqueRealtimeTopics]);

  useEffect(() => {
    if (stopsNearYou && stopsNearYou.nearest && stopsNearYou.nearest.edges) {
      const active = stopsNearYou.nearest.edges
        .slice()
        .filter(
          stop =>
            stop.node.place.stoptimesWithoutPatterns &&
            stop.node.place.stoptimesWithoutPatterns.length,
        );
      if (isTransitMode && !active.length && relay.hasMore()) {
        relay.loadMore(5);
        return;
      }
      let sortedEdges;
      if (!isTransitMode) {
        const withNetworks = stopsNearYou.nearest.edges.filter(edge => {
          return !!edge.node.place?.networks;
        });
        const filteredCityBikeEdges = withNetworks.filter(pattern => {
          return pattern.node.place?.networks.every(network =>
            getDefaultNetworks(context.config).includes(network),
          );
        });
        sortedEdges = filteredCityBikeEdges
          .slice()
          .sort(sortNearbyRentalStations(favouriteIds));
      } else {
        sortedEdges = active
          .slice()
          .sort(sortNearbyStops(favouriteIds, walkRoutingThreshold));
      }

      sortedEdges.unshift(
        ...prioritizedStopsNearYou.map(stop => {
          return {
            node: {
              distance: distance(position, stop),
              place: {
                ...stop,
              },
            },
          };
        }),
      );
      const stopsAndStations = handleStopsAndStations(sortedEdges);
      handleWalkRoutes(stopsAndStations);
      setSortedStopEdges(sortedEdges);
      setRoutes(sortedEdges);
    }
    if (mode === 'FAVORITE') {
      handleWalkRoutes(handleStopsAndStations(stopsNearYou));
      setSortedStopEdges(stopsNearYou);
      setRoutes(stopsNearYou);
    }
  }, [stopsNearYou, favouriteIds]);

  if (loading) {
    return <Loading />;
  }

  let leafletObjs = [];
  // create route lines
  if (isTransitMode && Array.isArray(routes)) {
    const getPattern = pattern =>
      pattern.patternGeometry ? pattern.patternGeometry.points : '';
    leafletObjs = uniqBy(routes, getPattern).map(pattern => {
      if (pattern.patternGeometry) {
        return (
          <Line
            key={`${pattern.code}`}
            opaque
            geometry={polyline.decode(pattern.patternGeometry.points)}
            mode={pattern.route.mode.toLowerCase()}
          />
        );
      }
      return null;
    });
  }

  if (uniqueRealtimeTopics.length > 0) {
    leafletObjs.push(
      <VehicleMarkerContainer key="vehicles" useLargeIcon mode={mode} />,
    );
  }
  if (
    firstPlan.itinerary.itineraries &&
    firstPlan.itinerary.itineraries.length > 0
  ) {
    leafletObjs.push(
      firstPlan.itinerary.itineraries.map((itinerary, i) => {
        return (
          <ItineraryLine
            key="itinerary"
            hash={i}
            legs={itinerary.legs}
            passive={false}
            showIntermediateStops={false}
            streetMode="walk"
          />
        );
      }),
    );
  }

  const hilightedStops = () => {
    const stopsAndStations = handleStopsAndStations(sortedStopEdges);
    if (Array.isArray(stopsAndStations) && stopsAndStations.length > 0) {
      return [
        stopsAndStations[0]?.gtfsId ||
          stopsAndStations[0]?.stationId ||
          stopsAndStations[0].node.place.gtfsId,
      ];
    }
    return [''];
  };

  // Marker for the search point.
  if (position.type !== 'CurrentLocation' && showWalkRoute) {
    leafletObjs.push(getLocationMarker(position));
  }

  const mapProps = {
    stopsToShow: mode === 'FAVORITE' ? Array.from(favouriteIds) : undefined,
    hilightedStops: hilightedStops(),
    mergeStops: false,
    mapLayers,
    mapLayerOptions,
    bounds,
    leafletObjs,
    breakpoint,
    onEndNavigation,
    onMapTracking,
  };

  if (breakpoint === 'large') {
    return <MapWithTracking {...mapProps} />;
  }
  return (
    <>
      <BackButton
        icon="icon-icon_arrow-collapse--left"
        iconClassName="arrow-icon"
        color={context.config.colors.primary}
        fallback="back"
      />
      <MapWithTracking {...mapProps} />
    </>
  );
}

StopsNearYouMap.propTypes = {
  currentTime: PropTypes.number.isRequired,
  stopsNearYou: PropTypes.object.isRequired,
  prioritizedStopsNearYou: PropTypes.array,
  favouriteIds: PropTypes.object.isRequired,
  mapLayers: PropTypes.object.isRequired,
  mapLayerOptions: mapLayerOptionsShape.isRequired,
  position: dtLocationShape.isRequired,
  match: matchShape.isRequired,
  breakpoint: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  relay: PropTypes.shape({
    refetchConnection: PropTypes.func,
    hasMore: PropTypes.func,
    loadMore: PropTypes.func,
    environment: PropTypes.object,
  }).isRequired,
  onEndNavigation: PropTypes.func,
  onMapTracking: PropTypes.func,
  loading: PropTypes.bool,
  showWalkRoute: PropTypes.bool,
};

StopsNearYouMap.defaultProps = {
  showWalkRoute: false,
  loading: false,
};

StopsNearYouMap.contextTypes = {
  config: PropTypes.object,
  executeAction: PropTypes.func,
  getStore: PropTypes.func,
};

export default StopsNearYouMap;
