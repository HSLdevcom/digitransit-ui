import PropTypes from 'prop-types';
import React from 'react';
import { tripShape, routeShape } from '../../utils/client/shapes';
import { getTripOrRouteText } from '../../utils/client/legUtils';
import RouteNumber from './RouteNumber';
import { useConfigContext } from '../client/ConfigContext';

const RouteNumberContainer = ({
  interliningWithRoute,
  trip,
  route,
  mode,
  hideText = false,
  ...props
}) => {
  const config = useConfigContext();
  return (
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
    )
  );
};

RouteNumberContainer.propTypes = {
  trip: tripShape,
  route: routeShape.isRequired,
  interliningWithRoute: PropTypes.string,
  mode: PropTypes.string,
  hideText: PropTypes.bool,
};

export default RouteNumberContainer;
