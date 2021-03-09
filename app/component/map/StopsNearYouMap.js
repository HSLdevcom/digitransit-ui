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
import withBreakpoint from '../../util/withBreakpoint';
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
import Loading from '../Loading';
import LazilyLoad, { importLazy } from '../LazilyLoad';
import { MAPSTATES } from '../../util/stopsNearYouUtils';

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
  if (!context.config.showNewMqtt) {
    return;
  }
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
  if (Array.isArray(edges)) {
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
  }
  return [];
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
    centerOfMap,
    setCenterOfMap,
    defaultMapCenter,
    mapState,
  },
  { ...context },
) {
  const [sortedStopEdges, setSortedStopEdges] = useState([]);
  const [uniqueRealtimeTopics, setUniqueRealtimeTopics] = useState([]);
  const [routes, setRouteLines] = useState([]);
  const [bounds, setBounds] = useState([]);
  const [useFitBounds, setUseFitBounds] = useState(false);
  const [clientOn, setClientOn] = useState(false);
  const [secondPlan, setSecondPlan] = useState({
    itinerary: [],
    isFetching: false,
    stop: null,
  });
  const [firstPlan, setFirstPlan] = useState({
    itinerary: [],
    isFetching: false,
    stop: null,
  });
  const { mode } = match.params;
  const walkRoutingThreshold =
    mode === 'RAIL' || mode === 'SUBWAY' || mode === 'FERRY' ? 3000 : 1500;
  const { environment } = relay;
  const fetchPlan = (stop, first) => {
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
        if (first) {
          setFirstPlan({ itinerary: result, isFetching: false, stop });
        } else {
          setSecondPlan({ itinerary: result, isFetching: false, stop });
        }
      });
    } else if (first) {
      setFirstPlan({ itinerary: [], isFetching: false, stop });
    } else {
      setSecondPlan({ itinerary: [], isFetching: false, stop });
    }
  };
  const handleWalkRoutes = stopsAndStations => {
    if (stopsAndStations.length > 0) {
      const firstStop = stopsAndStations[0];
      if (!isEqual(firstStop, firstPlan.stop)) {
        setFirstPlan({
          itinerary: firstPlan.itinerary,
          isFetching: true,
          stop: firstStop,
        });
        fetchPlan(firstStop, true);
      }
    }
    if (stopsAndStations.length > 1) {
      const secondStop = stopsAndStations[1];
      if (!isEqual(secondStop, secondPlan.stop)) {
        setSecondPlan({
          itinerary: secondPlan.itinerary,
          isFetching: true,
          stop: secondStop,
        });
        fetchPlan(secondStop, false);
      }
    }
  };

  useEffect(() => {
    let newBounds = [];
    if (sortedStopEdges.length > 0) {
      if (mapState === MAPSTATES.FITBOUNDSTOCENTER) {
        if (centerOfMap && centerOfMap.lat && centerOfMap.lon) {
          newBounds = handleBounds(centerOfMap, sortedStopEdges, breakpoint);
        }
      } else if (mapState === MAPSTATES.FITBOUNDSTOSEARCHPOSITION) {
        if (position && position.lat && position.lon) {
          newBounds = handleBounds(position, sortedStopEdges, breakpoint);
        }
      }
      if (newBounds && newBounds.length > 0) {
        setUseFitBounds(true);
      }
      setBounds(newBounds);
    }
  }, [mapState, sortedStopEdges]);

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
      if (!active.length && relay.hasMore()) {
        relay.loadMore(5);
        return;
      }
      const sortedEdges =
        mode === 'CITYBIKE'
          ? stopsNearYou.nearest.edges
              .slice()
              .sort(sortNearbyRentalStations(favouriteIds))
          : active
              .slice()
              .sort(sortNearbyStops(favouriteIds, walkRoutingThreshold));
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
  }, [stopsNearYou]);

  if (loading) {
    return <Loading />;
  }

  const renderRouteLines = mode !== 'CITYBIKE';
  let leafletObjs = [];
  if (renderRouteLines && Array.isArray(routes)) {
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
    leafletObjs.push(<VehicleMarkerContainer key="vehicles" useLargeIcon />);
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
  if (
    secondPlan.itinerary.itineraries &&
    secondPlan.itinerary.itineraries.length > 0
  ) {
    leafletObjs.push(
      secondPlan.itinerary.itineraries.map((itinerary, i) => {
        return (
          <ItineraryLine
            key="itinerary"
            hash={i}
            flipBubble
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
    if (
      Array.isArray(stopsAndStations) &&
      stopsAndStations.length > 0 &&
      mode !== 'CITYBIKE'
    ) {
      return [
        stopsAndStations[0]?.gtfsId ||
          stopsAndStations[0]?.stationId ||
          stopsAndStations[0].node.place.gtfsId,
      ];
    }
    return [''];
  };

  const useInitialMapTracking = () => {
    if (position && position.type === 'CenterOfMap') {
      return false;
    }
    return true;
  };

  // Marker for the search point.
  if (position && position.type !== 'CurrentLocation') {
    leafletObjs.push(getLocationMarker(position));
  }

  const zoom = 16;
  let map;
  if (breakpoint === 'large') {
    map = (
      <MapWithTracking
        breakpoint={breakpoint}
        showStops
        stopsToShow={Array.from(favouriteIds)}
        stopsNearYouMode={mode}
        showScaleBar
        fitBounds={useFitBounds}
        mapState={mapState}
        defaultMapCenter={defaultMapCenter || context.config.defaultEndpoint}
        disableParkAndRide
        boundsOptions={{ maxZoom: zoom }}
        bounds={bounds}
        fitBoundsWithSetCenter
        setInitialMapTracking={useInitialMapTracking()}
        hilightedStops={hilightedStops()}
        leafletObjs={leafletObjs}
        setCenterOfMap={setCenterOfMap}
      />
    );
  } else {
    map = (
      <>
        <BackButton
          icon="icon-icon_arrow-collapse--left"
          iconClassName="arrow-icon"
          color={context.config.colors.primary}
          fallback="back"
        />
        <MapWithTracking
          breakpoint={breakpoint}
          showStops
          stopsToShow={Array.from(favouriteIds)}
          stopsNearYouMode={mode}
          fitBounds={useFitBounds}
          mapState={mapState}
          defaultMapCenter={defaultMapCenter || context.config.defaultEndpoint}
          boundsOptions={{ maxZoom: zoom }}
          bounds={bounds}
          showScaleBar
          fitBoundsWithSetCenter
          setInitialMapTracking={useInitialMapTracking()}
          hilightedStops={hilightedStops()}
          leafletObjs={leafletObjs}
          setCenterOfMap={setCenterOfMap}
        />
      </>
    );
  }

  return map;
}

StopsNearYouMap.propTypes = {
  match: matchShape.isRequired,
  breakpoint: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  relay: PropTypes.shape({
    refetchConnection: PropTypes.func,
    hasMore: PropTypes.func,
    loadMore: PropTypes.func,
  }).isRequired,
  setCenterOfMap: PropTypes.func.isRequired,
  defaultMapCenter: PropTypes.shape({
    lat: PropTypes.number,
    lon: PropTypes.number,
  }),
};

StopsNearYouMap.contextTypes = {
  config: PropTypes.object,
  executeAction: PropTypes.func,
  getStore: PropTypes.func,
};

const StopsNearYouMapWithBreakpoint = withBreakpoint(StopsNearYouMap);

export default StopsNearYouMapWithBreakpoint;
