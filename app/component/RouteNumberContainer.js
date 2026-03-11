import PropTypes from 'prop-types';
import React from 'react';
import { tripShape, routeShape, configShape } from '../util/shapes';
import { getTripOrRouteText } from '../util/legUtils';
import RouteNumber from './RouteNumber';

const RouteNumberContainer = (
  { interliningWithRoute, trip, route, mode, hideText, ...props },
  { config },
) =>
  route && (
    <RouteNumber
      color={route.color ? `#${route.color}` : null}
      mode={mode !== undefined ? mode : route.mode}
      text={
        hideText
          ? ''
          : getTripOrRouteText(trip, route, config, interliningWithRoute)
      }
      {...props}
    />
  );

RouteNumberContainer.propTypes = {
  trip: tripShape,
  route: routeShape.isRequired,
  interliningWithRoute: PropTypes.string,
  mode: PropTypes.string,
  hideText: PropTypes.bool,
};

RouteNumberContainer.defaultProps = {
  trip: undefined,
  interliningWithRoute: undefined,
  mode: undefined,
  hideText: false,
};

RouteNumberContainer.contextTypes = {
  config: configShape.isRequired,
};

export default RouteNumberContainer;
