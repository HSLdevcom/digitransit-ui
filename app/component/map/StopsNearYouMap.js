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

import Line from './Line';
import MapWithTracking from './MapWithTracking';

function StopsNearYouMap(
  { breakpoint, origin, destination, routes, ...props },
  { config },
) {
  const { mode } = props.match.params;

  const routeLines = [];
  const renderRouteLines = mode !== 'BICYCLE';
  let leafletObjs = [];
  if (renderRouteLines) {
    routes.edges.forEach(item => {
      const { place } = item.node;
      place.routes.forEach(route => {
        route.patterns.forEach(pattern => {
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
          color={config.colors.primary}
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
                shortName
                patterns {
                  route {
                    mode
                  }
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
