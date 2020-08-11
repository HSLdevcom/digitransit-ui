import React from 'react';
import PropTypes from 'prop-types';
import { connectToStores } from 'fluxible-addons-react';
import { matchShape, routerShape } from 'found';
import { createFragmentContainer, graphql } from 'react-relay';

import uniqBy from 'lodash/uniqBy';
import polyline from 'polyline-encoded';
import withBreakpoint from '../../util/withBreakpoint';

import OriginStore from '../../store/OriginStore';
import DestinationStore from '../../store/DestinationStore';
import { dtLocationShape } from '../../util/shapes';
import PreferencesStore from '../../store/PreferencesStore';
import BackButton from '../BackButton';
import VehicleMarkerContainer from './VehicleMarkerContainer';

import Line from './Line';
import MapWithTracking from './MapWithTracking';
import { startRealTimeClient } from '../../action/realTimeClientAction';

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
  if (source && source.active) {
    const config = {
      ...source,
      agency,
      options: routes,
    };
    context.executeAction(startRealTimeClient, config);
  }
};

function StopsNearYouMap(
  { breakpoint, origin, destination, routes, ...props },
  { ...context },
) {
  const { mode } = props.match.params;

  const routeLines = [];
  const realtimeTopics = [];
  const renderRouteLines = mode !== 'BICYCLE';
  let leafletObjs = [];
  if (renderRouteLines) {
    routes.edges.forEach(item => {
      const { place } = item.node;
      place.routes.forEach(route => {
        route.patterns.forEach(pattern => {
          const feedId = route.gtfsId.split(':')[0];
          realtimeTopics.push({
            feedId,
            route: route.gtfsId.split(':')[1],
            shortName: route.shortName,
          });
          routeLines.push(pattern);
        });
      });
    });
    const getPattern = pattern =>
      pattern.patternGeometry ? pattern.patternGeometry.points : '';
    leafletObjs = uniqBy(routeLines, getPattern).map(pattern => {
      if (pattern.patternGeometry) {
        return (
          <Line
            opaque
            geometry={polyline.decode(pattern.patternGeometry.points)}
            mode={mode.toLowerCase()}
          />
        );
      }
      return null;
    });
  }
  const getRoute = route => route.route;

  startClient(context, uniqBy(realtimeTopics, getRoute));
  leafletObjs.push(<VehicleMarkerContainer key="vehicles" useLargeIcon />);
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
  router: routerShape.isRequired,
  breakpoint: PropTypes.string.isRequired,
  origin: dtLocationShape,
  destination: dtLocationShape,
  language: PropTypes.string.isRequired,
};

StopsNearYouMap.contextTypes = {
  config: PropTypes.object,
  executeAction: PropTypes.func,
};

StopsNearYouMap.defaultProps = {
  origin: {},
  destination: {},
};

const StopsNearYouMapWithBreakpoint = withBreakpoint(StopsNearYouMap);

const StopsNearYouMapWithStores = connectToStores(
  StopsNearYouMapWithBreakpoint,
  [OriginStore, DestinationStore, PreferencesStore],
  ({ getStore }) => {
    const origin = getStore(OriginStore).getOrigin();
    const destination = getStore(DestinationStore).getDestination();
    const language = getStore(PreferencesStore).getLanguage();
    return {
      origin,
      destination,
      language,
    };
  },
);

const containerComponent = createFragmentContainer(StopsNearYouMapWithStores, {
  routes: graphql`
    fragment StopsNearYouMap_routes on placeAtDistanceConnection
      @argumentDefinitions(
        startTime: { type: "Long!", defaultValue: 0 }
        omitNonPickups: { type: "Boolean!", defaultValue: false }
      ) {
      edges {
        node {
          place {
            __typename
            ... on Stop {
              routes {
                gtfsId
                shortName
                patterns {
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
    }
  `,
});

export {
  containerComponent as default,
  StopsNearYouMapWithBreakpoint as Component,
};
