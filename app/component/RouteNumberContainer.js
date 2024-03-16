import PropTypes from 'prop-types';
import React from 'react';
import { ConfigShape } from '../util/shapes';
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
    occupancyStatus,
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
      occupancyStatus={occupancyStatus}
      {...props}
    />
  );

RouteNumberContainer.propTypes = {
  alertSeverityLevel: PropTypes.string,
  route: PropTypes.object.isRequired,
  interliningWithRoute: PropTypes.string,
  isCallAgency: PropTypes.bool,
  vertical: PropTypes.bool,
  className: PropTypes.string,
  fadeLong: PropTypes.bool,
  withBicycle: PropTypes.bool,
  occupancyStatus: PropTypes.string,
};

RouteNumberContainer.defaultProps = {
  interliningWithRoute: undefined,
  alertSeverityLevel: undefined,
  isCallAgency: false,
  vertical: false,
  fadeLong: false,
  className: '',
  withBicycle: false,
  occupancyStatus: undefined,
};

RouteNumberContainer.contextTypes = {
  config: ConfigShape.isRequired,
};

RouteNumberContainer.displayName = 'RouteNumberContainer';
export default RouteNumberContainer;
