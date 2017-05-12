import React from 'react';
import get from 'lodash/get';

import RouteNumber from './RouteNumber';

const getText = (route, config) => {
  const showAgency = get(config, 'agency.show', false);
  if (route.shortName) {
    return route.shortName;
  } else if (showAgency && route.agency) {
    return route.agency.name;
  }
  return '';
};

const RouteNumberContainer = ({ className, route, isCallAgency, large, ...props }, { config }) =>
(route && <RouteNumber
  className={className}
  isCallAgency={isCallAgency || route.type === 715}
  mode={route.mode}
  large={large}
  text={getText(route, config)}
  {...props}
/>);


RouteNumberContainer.propTypes = {
  route: React.PropTypes.object.isRequired,
  vertical: React.PropTypes.bool,
  className: React.PropTypes.string,
  hasDisruption: React.PropTypes.bool,
  fadeLong: React.PropTypes.bool,
};

RouteNumberContainer.defaultProps = {
  className: '',
};

RouteNumberContainer.contextTypes = {
  config: React.PropTypes.object.isRequired,
};

RouteNumberContainer.displayName = 'RouteNumberContainer';
export default RouteNumberContainer;
