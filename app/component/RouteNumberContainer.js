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
    ...props
  },
  { config },
) => {
  const isOnDemandTaxi = route.type === 715;

  return (
    route && (
      <RouteNumber
        alertSeverityLevel={alertSeverityLevel}
        className={className}
        isCallAgency={isCallAgency || isOnDemandTaxi}
        color={route.color ? `#${route.color}` : null}
        mode={route.mode}
        icon={isOnDemandTaxi ? 'icon-icon_on-demand-taxi-white' : null}
        text={getLegText(route, config, interliningWithRoute)}
        withBicycle={withBicycle}
        {...props}
      />
    )
  );
};

RouteNumberContainer.propTypes = {
  alertSeverityLevel: PropTypes.string,
  route: PropTypes.object.isRequired,
  interliningWithRoute: PropTypes.number,
  isCallAgency: PropTypes.bool,
  vertical: PropTypes.bool,
  className: PropTypes.string,
  fadeLong: PropTypes.bool,
  withBicycle: PropTypes.bool,
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
