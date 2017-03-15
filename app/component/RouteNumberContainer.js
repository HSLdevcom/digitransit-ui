import React from 'react';
import get from 'lodash/get';
import { intlShape } from 'react-intl';

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

const RouteNumberContainer = ({ route, isCallAgency, ...props }, { config, intl }) =>
  (isCallAgency
    ? (route && <RouteNumber
      mode="call" text={intl.formatMessage({
        id: 'pay-attention',
        defaultMessage: 'Pay Attention',
      })} {...props}
    />)
    : (route && <RouteNumber mode={route.mode} text={getText(route, config)} {...props} />)
  );

RouteNumberContainer.propTypes = {
  route: React.PropTypes.object.isRequired,
  vertical: React.PropTypes.bool,
  className: React.PropTypes.string,
  hasDisruption: React.PropTypes.bool,
  fadeLong: React.PropTypes.bool,
};

RouteNumberContainer.contextTypes = {
  config: React.PropTypes.object.isRequired,
  intl: intlShape,
};

RouteNumberContainer.displayName = 'RouteNumberContainer';
export default RouteNumberContainer;
