import PropTypes from 'prop-types';
import React from 'react';
import { getLegText } from '../util/legUtils';
import RouteNumber from './RouteNumber';

const RouteNumberContainer = (
  {
    alertSeverityLevel,
    interliningWithRoute,
    className,
    route,
    isCallAgency,
    withBicycle,
    hasOneTransitLeg,
    ...props
  },
  { config },
) =>
  route && (
    <RouteNumber
      alertSeverityLevel={alertSeverityLevel}
      className={className}
      isCallAgency={isCallAgency || route.type === 715}
      color={route.color ? `#${route.color}` : null}
      mode={route.mode}
      text={getLegText(route, config, interliningWithRoute)}
      withBicycle={withBicycle}
      hasOneTransitLeg={hasOneTransitLeg}
      {...props}
    />
  );

RouteNumberContainer.propTypes = {
  alertSeverityLevel: PropTypes.string,
  route: PropTypes.object.isRequired,
  interliningWithRoute: PropTypes.number,
  isCallAgency: PropTypes.bool,
  vertical: PropTypes.bool,
  className: PropTypes.string,
  fadeLong: PropTypes.bool,
  withBicycle: PropTypes.bool,
  hasOneTransitLeg: PropTypes.bool,
};

RouteNumberContainer.defaultProps = {
  alertSeverityLevel: undefined,
  className: '',
  withBicycle: false,
};

RouteNumberContainer.contextTypes = {
  config: PropTypes.object.isRequired,
};

RouteNumberContainer.displayName = 'RouteNumberContainer';
export default RouteNumberContainer;
