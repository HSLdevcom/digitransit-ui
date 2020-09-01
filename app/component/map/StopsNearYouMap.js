import React, { useEffect, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { connectToStores } from 'fluxible-addons-react';
import { matchShape, routerShape } from 'found';
import { createFragmentContainer, graphql, fetchQuery } from 'react-relay';
import moment from 'moment';
import uniqBy from 'lodash/uniqBy';
import polyline from 'polyline-encoded';
import ReactRelayContext from 'react-relay/lib/ReactRelayContext';
import withBreakpoint from '../../util/withBreakpoint';
import TimeStore from '../../store/TimeStore';
import PositionStore from '../../store/PositionStore';
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

const getMapitems = stops => {
  const realtimeTopics = [];
  const routeLines = [];
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
  return [realtimeTopics, routeLines];
};

function StopsNearYouMap(
  { breakpoint, origin, currentTime, destination, stops, ...props },
  { ...context },
) {
  const { environment } = useContext(ReactRelayContext);
  const [plan, setPlan] = useState({ plan: undefined, isFetching: false });
  const [realtimeTopics, setRealtimeTopics] = useState([]);
  const [routeLines, setRouteLines] = useState([]);

  const { mode } = props.match.params;
  const uniqueRealtimeTopics = uniqBy(realtimeTopics, route => route.route);
  useEffect(() => {
    if (mode !== 'CITYBIKE') {
      const [realtimeTopicss, routeLiness] = getMapitems(stops);
      setRealtimeTopics(realtimeTopicss);
      setRouteLines(routeLiness);
    }
  }, []);

  useEffect(
    () => {
      startClient(context, realtimeTopics);
      return function cleanup() {
        stopClient(context);
      };
    },
    [realtimeTopics],
  );

  useEffect(
    () => {
      let isMounted = true;
      const fetchPlan = async stop => {
        if (props.locationState.hasLocation && props.locationState.address) {
          const toPlace = {
            address: stop.name ? stop.name : 'stop',
            lon: stop.lon,
            lat: stop.lat,
          };
          const variables = {
            fromPlace: addressToItinerarySearch(props.locationState),
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
          fetchQuery(environment, query, variables).then(({ plan: result }) => {
            if (isMounted) {
              setPlan({ plan: result, isFetching: false });
            }
          });
        }
      };
      if (
        stops.edges.length > 0 &&
        props.locationState.hasLocation &&
        !plan.plan
      ) {
        const stop = stops.edges[0].node.place;
        setPlan({ plan: plan.plan, isFetching: true });
        fetchPlan(stop);
      }
      return () => {
        isMounted = false;
      };
    },
    [props.locationState.status],
  );
  if (props.locationState.loadingPosition || props.loading) {
    return <Loading />;
  }

  const renderRouteLines = mode !== 'CITYBIKE';
  let leafletObjs = [];
  if (renderRouteLines) {
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

  if (uniqueRealtimeTopics.length > 0) {
    leafletObjs.push(<VehicleMarkerContainer key="vehicles" useLargeIcon />);
  }
  if (plan.plan && plan.plan.itineraries) {
    leafletObjs.push(
      ...plan.plan.itineraries.map((itinerary, i) => (
        <ItineraryLine
          key="itinerary"
          hash={i}
          legs={itinerary.legs}
          passive={false}
          showIntermediateStops={false}
          streetMode="walk"
        />
      )),
    );
  }
  const hilightedStops = () => {
    if (stops.edges.length > 0 && mode !== 'CITYBIKE') {
      return [stops.edges[0].node.place.gtfsId];
    }
    return [''];
  };

  let map;
  if (breakpoint === 'large') {
    map = (
      <MapWithTracking
        breakpoint={breakpoint}
        showStops
        stopsNearYouMode={mode}
        showScaleBar
        setInitialZoom={17}
        origin={origin}
        destination={destination}
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
        />
        <MapWithTracking
          breakpoint={breakpoint}
          showStops
          stopsNearYouMode={mode}
          showScaleBar
          setInitialZoom={17}
          origin={origin}
          destination={destination}
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
  [TimeStore, PreferencesStore, PositionStore],
  ({ getStore }) => {
    const currentTime = getStore(TimeStore)
      .getCurrentTime()
      .unix();
    const language = getStore(PreferencesStore).getLanguage();
    const locationState = getStore(PositionStore).getLocationState();
    return {
      language,
      locationState,
      currentTime,
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
