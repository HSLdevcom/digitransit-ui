import React, { useEffect, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { connectToStores } from 'fluxible-addons-react';
import { matchShape, routerShape } from 'found';
import { createFragmentContainer, graphql, fetchQuery } from 'react-relay';
import moment from 'moment';
import uniqBy from 'lodash/uniqBy';
import compact from 'lodash/compact';
import indexOf from 'lodash/indexOf';
import polyline from 'polyline-encoded';
import ReactRelayContext from 'react-relay/lib/ReactRelayContext';
import withBreakpoint from '../../util/withBreakpoint';
import TimeStore from '../../store/TimeStore';
import OriginStore from '../../store/OriginStore';
import DestinationStore from '../../store/DestinationStore';
import PositionStore from '../../store/PositionStore';
import { parseLocation } from '../../util/path';
import { dtLocationShape } from '../../util/shapes';
import PreferencesStore from '../../store/PreferencesStore';
import BackButton from '../BackButton';
import VehicleMarkerContainer from './VehicleMarkerContainer';
import Line from './Line';
import MapWithTracking from './MapWithTracking';
import {
  startRealTimeClient,
  stopRealTimeClient,
} from '../../action/realTimeClientAction';
import { addressToItinerarySearch } from '../../util/otpStrings';
import ItineraryLine from './ItineraryLine';
import Loading from '../Loading';
import LazilyLoad, { importLazy } from '../LazilyLoad';

const locationMarkerModules = {
  LocationMarker: () =>
    importLazy(import(/* webpackChunkName: "map" */ './LocationMarker')),
};
const handleStopsAndStations = stops => {
  const terminalNames = [];
  const stopsAndStations = stops.edges.map(({ node }) => {
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

const handleBounds = (location, stops) => {
  if (!location || (location.lat === 0 && location.lon === 0)) {
    // Still waiting for a location
    return [];
  }
  if (location.lat && stops && stops.edges) {
    const { edges } = stops;
    if (!edges || edges.length === 0) {
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
    origin,
    currentTime,
    destination,
    stops,
    locationState,
    ...props
  },
  { ...context },
) {
  let useFitBounds = true;
  const bounds = handleBounds(locationState, stops);

  if (!bounds.length) {
    useFitBounds = false;
  }
  let uniqueRealtimeTopics;
  const { environment } = useContext(ReactRelayContext);
  const [secondPlan, setSecondPlan] = useState({
    itinerary: [],
    isFetching: false,
  });
  const [firstPlan, setFirstPlan] = useState({
    itinerary: [],
    isFetching: false,
  });
  const stopsAndStations = handleStopsAndStations(stops);

  const fetchPlan = (stop, first) => {
    if (locationState && locationState.lat) {
      const toPlace = {
        address: stop.name ? stop.name : 'stop',
        lon: stop.lon,
        lat: stop.lat,
      };
      const variables = {
        fromPlace: addressToItinerarySearch(locationState),
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
      if (stop.distance < 2000) {
        fetchQuery(environment, query, variables).then(({ plan: result }) => {
          if (first) {
            setFirstPlan({ itinerary: result, isFetching: false });
          } else {
            setSecondPlan({ itinerary: result, isFetching: false });
          }
        });
      }
    }
  };

  useEffect(() => {
    startClient(context, uniqueRealtimeTopics);
    return function cleanup() {
      stopClient(context);
    };
  }, []);

  if (locationState.loadingPosition || props.loading) {
    return <Loading />;
  }

  useEffect(() => {
    if (stops.edges && stops.edges.length > 0) {
      const firstStop = stopsAndStations[0];
      const secondStop = stopsAndStations[1];
      if (firstStop) {
        setFirstPlan({ itinerary: firstPlan.itinerary, isFetching: true });
        fetchPlan(firstStop, true);
      }
      if (secondStop) {
        setSecondPlan({ itinerary: secondPlan.itinerary, isFetching: true });
        fetchPlan(stopsAndStations[1], false);
      }
    }
  }, []);

  const { mode } = props.match.params;
  const placeForMarker = parseLocation(props.match.params.place);
  const routeLines = [];
  const realtimeTopics = [];
  const renderRouteLines = mode !== 'CITYBIKE';
  let leafletObjs = [];
  if (renderRouteLines && stops.edges) {
    stops.edges.forEach(item => {
      const { place } = item.node;
      place.patterns.forEach(pattern => {
        const feedId = pattern.route.gtfsId.split(':')[0];
        realtimeTopics.push({
          feedId,
          route: pattern.route.gtfsId.split(':')[1],
          shortName: pattern.route.shortName,
        });
        routeLines.push(pattern);
      });
    });
    const getPattern = pattern =>
      pattern.patternGeometry ? pattern.patternGeometry.points : '';
    leafletObjs = uniqBy(routeLines, getPattern).map(pattern => {
      if (pattern.patternGeometry) {
        return (
          <Line
            key={`${pattern.code}`}
            opaque
            geometry={polyline.decode(pattern.patternGeometry.points)}
            mode={mode.toLowerCase()}
          />
        );
      }
      return null;
    });
  }

  uniqueRealtimeTopics = uniqBy(realtimeTopics, route => route.route);

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
    if (stops.edges && stops.edges.length > 0 && mode !== 'CITYBIKE') {
      return [stops.edges[0].node.place.gtfsId];
    }
    return [''];
  };
  // Marker for the search point.
  if (locationState.hasLocation) {
    leafletObjs.push(getLocationMarker(locationState));
  } else if (
    placeForMarker &&
    placeForMarker !== 'POS' &&
    placeForMarker.ready
  ) {
    leafletObjs.push(getLocationMarker(placeForMarker));
  } else {
    leafletObjs.push(getLocationMarker(context.config.defaultEndpoint));
  }
  let map;
  if (breakpoint === 'large') {
    map = (
      <MapWithTracking
        breakpoint={breakpoint}
        showStops
        stopsNearYouMode={mode}
        showScaleBar
        fitBounds={useFitBounds}
        defaultMapCenter={context.config.defaultEndpoint}
        initialZoom={16}
        bounds={bounds}
        origin={origin}
        destination={destination}
        fitBoundsWithSetCenter
        setInitialMapTracking
        hilightedStops={hilightedStops()}
        disableLocationPopup
        leafletObjs={leafletObjs}
      />
    );
  } else {
    map = (
      <>
        <BackButton
          icon="icon-icon_arrow-collapse--left"
          iconClassName="arrow-icon"
          color={context.config.colors.primary}
          urlToBack={context.config.URL.REDIRECT_BACK}
        />
        <MapWithTracking
          breakpoint={breakpoint}
          showStops
          stopsNearYouMode={mode}
          fitBounds={useFitBounds}
          defaultMapCenter={context.config.defaultEndpoint}
          initialZoom={16}
          bounds={bounds}
          showScaleBar
          origin={origin}
          destination={destination}
          fitBoundsWithSetCenter
          setInitialMapTracking
          hilightedStops={hilightedStops()}
          disableLocationPopup
          leafletObjs={leafletObjs}
        />
      </>
    );
  }
  return map;
}

StopsNearYouMap.propTypes = {
  match: matchShape.isRequired,
  locationState: dtLocationShape,
  breakpoint: PropTypes.string.isRequired,
  origin: dtLocationShape,
  destination: dtLocationShape,
  language: PropTypes.string.isRequired,
};

StopsNearYouMap.contextTypes = {
  router: routerShape.isRequired,
  config: PropTypes.object,
  executeAction: PropTypes.func,
  getStore: PropTypes.func,
};

StopsNearYouMap.defaultProps = {
  origin: {},
  destination: {},
};

const StopsNearYouMapWithBreakpoint = withBreakpoint(StopsNearYouMap);

const StopsNearYouMapWithStores = connectToStores(
  StopsNearYouMapWithBreakpoint,
  [OriginStore, TimeStore, DestinationStore, PreferencesStore, PositionStore],
  ({ getStore }, props) => {
    const currentTime = getStore(TimeStore).getCurrentTime().unix();
    const origin = getStore(OriginStore).getOrigin();
    const destination = getStore(DestinationStore).getDestination();
    const language = getStore(PreferencesStore).getLanguage();
    let locationState;
    if (props.match.params.place !== 'POS') {
      locationState = props.position;
    } else {
      locationState = getStore(PositionStore).getLocationState();
    }
    return {
      origin,
      destination,
      language,
      currentTime,
      locationState,
    };
  },
);

const containerComponent = createFragmentContainer(StopsNearYouMapWithStores, {
  stops: graphql`
    fragment StopsNearYouMap_stops on placeAtDistanceConnection
    @argumentDefinitions(
      startTime: { type: "Long!", defaultValue: 0 }
      omitNonPickups: { type: "Boolean!", defaultValue: false }
    ) {
      edges {
        node {
          distance
          place {
            __typename
            ... on BikeRentalStation {
              name
              lat
              lon
            }
            ... on Stop {
              gtfsId
              lat
              lon
              name
              parentStation {
                lat
                lon
                name
                gtfsId
              }
              patterns {
                route {
                  gtfsId
                  shortName
                }
                code
                directionId
                patternGeometry {
                  points
                }
              }
            }
          }
        }
      }
    }
  `,
});

export {
  containerComponent as default,
  StopsNearYouMapWithBreakpoint as Component,
};
