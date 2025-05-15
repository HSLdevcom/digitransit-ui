import PropTypes from 'prop-types';
import React from 'react';
import { routeShape, configShape } from '../util/shapes';
import { getRouteText } from '../util/legUtils';
import RouteNumber from './RouteNumber';

const RouteNumberContainer = (
  { interliningWithRoute, route, mode, hideText, ...props },
  { config },
) =>
  route && (
    <RouteNumber
      color={route.color ? `#${route.color}` : null}
      mode={mode !== undefined ? mode : route.mode}
      text={hideText ? '' : getRouteText(route, config, interliningWithRoute)}
      {...props}
    />
  );

RouteNumberContainer.propTypes = {
  route: routeShape.isRequired,
  interliningWithRoute: PropTypes.string,
  mode: PropTypes.string,
  hideText: PropTypes.bool,
};

RouteNumberContainer.defaultProps = {
  interliningWithRoute: undefined,
  mode: undefined,
  hideText: false,
};

RouteNumberContainer.contextTypes = {
  config: configShape.isRequired,
};

export default RouteNumberContainer;
