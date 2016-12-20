import React from 'react';
import get from 'lodash/get';

import config from '../config';
import RouteNumber from './RouteNumber';

const getText = (route) => {
  const showAgency = get(config, 'agency.show', false);
  if (route.shortName) {
    return route.shortName;
  } else if (showAgency && route.agency) {
    return route.agency.name;
  }
  return '';
};

const getMode = route =>
  route.mode || (route.rentedBike && 'CITYBIKE');

const RouteNumberContainer = ({ route, ...props }) =>
  route && <RouteNumber mode={getMode(route)} text={getText(route)} {...props} />;

RouteNumberContainer.propTypes = {
  route: React.PropTypes.object.isRequired,
  vertical: React.PropTypes.bool,
  className: React.PropTypes.string,
  hasDisruption: React.PropTypes.bool,
  fadeLong: React.PropTypes.bool,
};

RouteNumberContainer.displayName = 'RouteNumberContainer';
export default RouteNumberContainer;
