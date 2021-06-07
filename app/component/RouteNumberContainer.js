import PropTypes from 'prop-types';
import React from 'react';
import get from 'lodash/get';

import RouteNumber from './RouteNumber';

const getText = (route, config) => {
  const showAgency = get(config, 'agency.show', false);
  if (route.shortName) {
    return route.shortName;
  }
  if (showAgency && route.agency) {
    return route.agency.name;
  }
  return '';
};

const RouteNumberContainer = (
  { alertSeverityLevel, className, route, isCallAgency, withBicycle, ...props },
  { config },
) =>
  route && (
    <RouteNumber
      alertSeverityLevel={alertSeverityLevel}
      className={className}
      isCallAgency={isCallAgency || route.type === 715}
      color={route.color ? `#${route.color}` : null}
      mode={route.mode}
      icon={
        route.shortName?.startsWith('RT') ? 'icon-icon_on-demand-taxi' : null
      }
      text={getText(route, config)}
      withBicycle={withBicycle}
      {...props}
    />
  );

RouteNumberContainer.propTypes = {
  alertSeverityLevel: PropTypes.string,
  route: PropTypes.object.isRequired,
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
