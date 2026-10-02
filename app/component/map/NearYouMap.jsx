import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { fetchQuery } from 'react-relay';
import uniqBy from 'lodash/uniqBy';
import isEqual from 'lodash/isEqual';
import polyline from 'polyline-encoded';
import distance from '@digitransit-search-util/digitransit-search-util-distance';
import { useMatch } from 'found';
import {
  locationShape,
  relayShape,
  stopShape,
} from '../../../utils/client/shapes';
import { useConfigContext } from '../../client/ConfigContext';
import BackButton from '../BackButton';
import VehicleMarkerContainer from './VehicleMarkerContainer';
import Line from './Line';
import MapWithTracking from './MapWithTracking';
import { getSettings } from '../../../utils/client/planParamUtil';
import {
  startRealTimeClient,
  stopRealTimeClient,
  changeRealTimeClientTopics,
} from '../../action/realTimeClientAction';
import {
  sortNearYouRentalStations,
  sortNearYouStops,
} from '../../../utils/client/sortUtils';
import ItineraryLine from './ItineraryLine';
import Loading from '../Loading';
import { getRouteMode } from '../../../utils/client/modeUtils';
import CookieSettingsButton from '../CookieSettingsButton';
import { streetQuery } from './StreetQuery';
import LocationMarker from './LocationMarker';
import { splitGtfsId } from '../../../utils/shared/gtfs';

function getId(edge) {
  const { place } = edge.node;
  return place.gtfsId || place.stationId || place.id;
}

const getRealTimeSettings = (routes, config) => {
  const { realTime } = config;

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

const startClient = (context, config, routes) => {
  const rtConfig = getRealTimeSettings(routes, config);
  if (rtConfig) {
    context.executeAction(startRealTimeClient, rtConfig);
  }
};

const stopClient = context => {
  const { client } = context.getStore('RealTimeInformationStore');
  if (client) {
    context.executeAction(stopRealTimeClient, client);
  }
};

const updateClient = (context, config, topics) => {
  const { client } = context.getStore('RealTimeInformationStore');
  const rtConfig = getRealTimeSettings(topics, config);
  if (rtConfig) {
    if (client) {
      rtConfig.client = client;
      context.executeAction(changeRealTimeClientTopics, rtConfig);
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

const EMPTY_ARRAY = [];

function NearYouMap(
  {
    breakpoint,
    stops = EMPTY_ARRAY,
    loading = false,
    favouriteIds,
    relay,
    position,
    showWalkRoute = false,
    prioritizedStops = EMPTY_ARRAY,
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
  const match = useMatch();
  const { mode } = match.params;
  let streetRoutingLimit;

  switch (mode) {
    case 'RAIL':
    case 'SUBWAY':
    case 'FERRY':
      streetRoutingLimit = 3000;
      break;
    case 'CARPARK':
      streetRoutingLimit = 30000;
      break;
    case 'BIKEPARK':
      streetRoutingLimit = 5000;
      break;
    default:
      streetRoutingLimit = 1500;
      break;
  }

  const { environment } = relay;
  const config = useConfigContext();
  const isTransitMode = !nonTransit.includes(mode);

  const fetchPlan = node => {
    if (node.distance < streetRoutingLimit) {
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
      let routingMode = 'WALK';
      if (mode === 'CARPARK') {
        routingMode = 'CAR';
      } else if (mode === 'BIKEPARK') {
        routingMode = 'BICYCLE';
      }
      const variables = {
        mode: routingMode,
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
      fetchQuery(environment, streetQuery, variables)
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
          const { feedId, entityId: route } = splitGtfsId(pattern.route.gtfsId);
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
        startClient(context, config, uniqueRealtimeTopics);
        clientOn.current = true;
      } else {
        updateClient(context, config, uniqueRealtimeTopics);
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
        sortedEdges = stops.nearest.edges
          .slice()
          .sort(sortNearYouRentalStations(favouriteIds));
      } else if (isTransitMode) {
        sortedEdges = stops.nearest.edges
          .slice()
          .sort(sortNearYouStops(favouriteIds, streetRoutingLimit));
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
      <BackButton fallback="back" />
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
  breakpoint: PropTypes.string.isRequired,
  relay: relayShape.isRequired,
  loading: PropTypes.bool,
  showWalkRoute: PropTypes.bool,
};

NearYouMap.contextTypes = {
  executeAction: PropTypes.func,
  getStore: PropTypes.func,
};

export default NearYouMap;
