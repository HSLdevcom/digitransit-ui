import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { matchShape } from 'found';
import { fetchQuery } from 'react-relay';
import uniqBy from 'lodash/uniqBy';
import isEqual from 'lodash/isEqual';
import polyline from 'polyline-encoded';
import distance from '@digitransit-search-util/digitransit-search-util-distance';
import BackButton from '../BackButton';
import VehicleMarkerContainer from './VehicleMarkerContainer';
import Line from './Line';
import MapWithTracking from './MapWithTracking';
import { getSettings } from '../../util/planParamUtil';
import {
  startRealTimeClient,
  stopRealTimeClient,
  changeRealTimeClientTopics,
} from '../../action/realTimeClientAction';
import {
  sortNearYouRentalStations,
  sortNearYouStops,
} from '../../util/sortUtils';
import ItineraryLine from './ItineraryLine';
import {
  locationShape,
  relayShape,
  configShape,
  stopShape,
} from '../../util/shapes';
import Loading from '../Loading';
import { getDefaultNetworks } from '../../util/vehicleRentalUtils';
import { getRouteMode } from '../../util/modeUtils';
import CookieSettingsButton from '../CookieSettingsButton';
import { walkQuery } from './WalkQuery';
import LocationMarker from './LocationMarker';

function getId(edge) {
  const { place } = edge.node;
  return place.gtfsId || place.stationId || place.id;
}

const getRealTimeSettings = (routes, context) => {
  const { realTime } = context.config;

  /* handle multiple feedid case by taking most popular feedid */
  const feeds = {};
  routes.forEach(r => {
    if (realTime[r.feedId]) {
      feeds[r.feedId] = feeds[r.feedId] ? feeds[r.feedId] + 1 : 1;
    }
  });
  let best = 0;
  let feedId;
  Object.keys(feeds).forEach(key => {
    const value = feeds[key];
    if (value > best) {
      best = value;
      feedId = key;
    }
  });

  const source = feedId && realTime[feedId];
  if (source?.active) {
    return {
      ...source,
      feedId,
      options: routes,
    };
  }
  return null;
};

const startClient = (context, routes) => {
  const config = getRealTimeSettings(routes, context);
  if (config) {
    context.executeAction(startRealTimeClient, config);
  }
};

const stopClient = context => {
  const { client } = context.getStore('RealTimeInformationStore');
  if (client) {
    context.executeAction(stopRealTimeClient, client);
  }
};

const updateClient = (context, topics) => {
  const { client } = context.getStore('RealTimeInformationStore');
  const config = getRealTimeSettings(topics, context);
  if (config) {
    if (client) {
      config.client = client;
      context.executeAction(changeRealTimeClientTopics, config);
    }
  }
};

const handleBounds = (location, edges) => {
  if (edges.length === 0) {
    // No stops anywhere near
    return [
      [location.lat, location.lon],
      [location.lat, location.lon],
    ];
  }
  const nearestStop = edges[0].node.place;
  const bounds = [
    [nearestStop.lat, nearestStop.lon],
    [
      location.lat + location.lat - nearestStop.lat,
      location.lon + location.lon - nearestStop.lon,
    ],
  ];
  return bounds;
};

const nonTransit = ['CITYBIKE', 'BIKEPARK', 'CARPARK'];

function NearYouMap(
  {
    breakpoint,
    stops,
    match,
    loading,
    favouriteIds,
    relay,
    position,
    showWalkRoute,
    prioritizedStops,
    ...rest
  },
  context,
) {
  const [sortedStopEdges, setSortedStopEdges] = useState([]);
  const [uniqueRealtimeTopics, setUniqueRealtimeTopics] = useState([]);
  const [routeLines, setRouteLines] = useState([]);
  const [bounds, setBounds] = useState([]);
  const [walk, setWalk] = useState({ itinerary: null, stop: null });
  const clientOn = useRef(false);
  const mwtRef = useRef();
  const { mode } = match.params;
  const walkRoutingThreshold =
    mode === 'RAIL' || mode === 'SUBWAY' || mode === 'FERRY' ? 3000 : 1500;
  const { environment } = relay;
  const { config } = context;
  const isTransitMode = !nonTransit.includes(mode);

  const fetchPlan = node => {
    if (node.distance < walkRoutingThreshold) {
      const settings = getSettings(config);
      let location = {
        coordinate: {
          latitude: node.place.lat,
          longitude: node.place.lon,
        },
      };
      if (node.place.gtfsId) {
        location = {
          stopLocation: { stopLocationId: node.place.gtfsId },
        };
      }
      const variables = {
        origin: {
          location: {
            coordinate: { latitude: position.lat, longitude: position.lon },
          },
        },
        destination: {
          location,
        },
        walkSpeed: settings.walkSpeed,
        wheelchair: !!settings.accessibilityOption,
      };
      fetchQuery(environment, walkQuery, variables)
        .toPromise()
        .then(result => {
          setWalk({
            itinerary: result.plan.edges.length
              ? result.plan.edges[0].node
              : null,
            node,
          });
        });
    } else {
      setWalk({ itinerary: null, node });
    }
  };

  const handleWalkRoutes = edges => {
    if (showWalkRoute && edges.length > 0) {
      const first = edges[0];
      const shouldFetch =
        (mode !== 'BUS' && mode !== 'TRAM') || favouriteIds.has(getId(first));
      if (shouldFetch && !isEqual(first.node, walk.node)) {
        fetchPlan(first.node);
      } else if (!shouldFetch) {
        setWalk({ itinerary: null, node: null });
      }
    } else {
      setWalk({ itinerary: null, node: null });
    }
  };

  // get ref to MapWithTracking.js
  const setMWTRef = ref => {
    mwtRef.current = ref;
  };

  useEffect(() => {
    return function cleanup() {
      stopClient(context);
    };
  }, []);

  useEffect(() => {
    const newBounds = handleBounds(position, sortedStopEdges);
    if (newBounds.length > 0) {
      setBounds(newBounds);
      setTimeout(() => mwtRef.current?.map?.updateZoom(), 1);
    }
  }, [position, sortedStopEdges]);

  const updateRoutes = edges => {
    let patterns = [];
    const realtimeTopics = [];
    edges.forEach(item => {
      const { place } = item.node;
      const stopArray = place.stops || [place]; // station stops, single stop or other place
      stopArray.forEach(stop => {
        stop.patterns?.forEach(pattern => {
          const [feedId, route] = pattern.route.gtfsId.split(':');
          realtimeTopics.push({
            feedId,
            route,
            shortName: pattern.route.shortName,
            type: pattern.route.type,
          });
          patterns.push(pattern);
        });
      });
    });

    patterns = uniqBy(patterns, p => p.patternGeometry?.points || '');
    const lines = patterns
      .filter(p => p.patternGeometry?.points)
      .map(p => (
        <Line
          key={`${p.code}`}
          opaque
          geometry={polyline.decode(p.patternGeometry.points)}
          mode={getRouteMode(p.route)}
        />
      ));
    setRouteLines(lines);
    setUniqueRealtimeTopics(uniqBy(realtimeTopics, topic => topic.route));
  };

  useEffect(() => {
    if (uniqueRealtimeTopics.length > 0) {
      if (!clientOn.current) {
        startClient(context, uniqueRealtimeTopics);
        clientOn.current = true;
      } else {
        updateClient(context, uniqueRealtimeTopics);
      }
    }
  }, [uniqueRealtimeTopics]);

  useEffect(() => {
    if (!stops) {
      return;
    }
    let sortedEdges;
    if (stops.nearest?.edges) {
      if (mode === 'CITYBIKE') {
        const withNetworks = stops.nearest.edges.filter(edge => {
          return !!edge.node.place?.rentalNetwork?.networkId;
        });
        const filteredCityBikeEdges = withNetworks.filter(pattern => {
          return getDefaultNetworks(config).includes(
            pattern.node.place?.rentalNetwork.networkId,
          );
        });
        sortedEdges = filteredCityBikeEdges
          .slice()
          .sort(sortNearYouRentalStations(favouriteIds));
      } else if (isTransitMode) {
        sortedEdges = stops.nearest.edges
          .slice()
          .sort(sortNearYouStops(favouriteIds, walkRoutingThreshold));
      } else {
        sortedEdges = stops.nearest.edges.slice();
      }

      sortedEdges.unshift(
        ...prioritizedStops.map(stop => {
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
    } else if (mode === 'FAVORITE') {
      sortedEdges = stops;
    }
    handleWalkRoutes(sortedEdges);
    setSortedStopEdges(sortedEdges);
    updateRoutes(sortedEdges);
  }, [stops, favouriteIds]);

  if (loading) {
    return <Loading />;
  }

  const leafletObjs = isTransitMode ? [...routeLines] : [];
  if (uniqueRealtimeTopics.length > 0) {
    leafletObjs.push(
      <VehicleMarkerContainer
        key="vehicles"
        useLargeIcon
        mode={mode === 'FAVORITE' ? undefined : mode}
        topics={uniqueRealtimeTopics}
      />,
    );
  }
  if (walk.itinerary) {
    leafletObjs.push(
      <ItineraryLine
        key="itinerary"
        legs={walk.itinerary.legs}
        passive={false}
        showIntermediateStops={false}
        streetMode="walk"
      />,
    );
  }

  // Marker for the search point.
  if (position.type !== 'CurrentLocation' && showWalkRoute) {
    leafletObjs.push(
      <LocationMarker
        key={`from-${position.lat}:${position.lon}`}
        position={position}
        type="from"
      />,
    );
  }

  const mapProps = {
    stopsToShow: mode === 'FAVORITE' ? Array.from(favouriteIds) : undefined,
    highlightedStops: sortedStopEdges.length ? [getId(sortedStopEdges[0])] : [],
    mergeStops: false,
    bounds,
    leafletObjs,
    breakpoint,
    setMWTRef,
    ...rest,
  };

  if (breakpoint === 'large') {
    return (
      <>
        {config.useCookiesPrompt && <CookieSettingsButton />}
        <MapWithTracking {...mapProps} />
      </>
    );
  }
  return (
    <>
      <BackButton
        icon="icon_arrow-collapse--left"
        iconClassName="arrow-icon"
        color={config.colors.primary}
        fallback="back"
      />
      <MapWithTracking {...mapProps} />
    </>
  );
}

NearYouMap.propTypes = {
  stops: PropTypes.oneOfType([
    PropTypes.shape({
      nearest: PropTypes.shape({
        // eslint-disable-next-line
      edges: PropTypes.arrayOf(PropTypes.object).isRequired,
      }).isRequired,
    }),
    PropTypes.arrayOf(PropTypes.object),
  ]),
  prioritizedStops: PropTypes.arrayOf(stopShape),
  // eslint-disable-next-line
  favouriteIds: PropTypes.object.isRequired,
  position: locationShape.isRequired,
  match: matchShape.isRequired,
  breakpoint: PropTypes.string.isRequired,
  relay: relayShape.isRequired,
  loading: PropTypes.bool,
  showWalkRoute: PropTypes.bool,
};

NearYouMap.defaultProps = {
  stops: [],
  showWalkRoute: false,
  loading: false,
  prioritizedStops: [],
};

NearYouMap.contextTypes = {
  config: configShape,
  executeAction: PropTypes.func,
  getStore: PropTypes.func,
};

export default NearYouMap;
