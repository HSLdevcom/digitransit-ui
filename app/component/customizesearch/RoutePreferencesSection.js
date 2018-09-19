import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { routerShape } from 'react-router';

import Checkbox from '../Checkbox';
import { replaceQueryParams } from '../../util/queryUtils';
import { OptimizeType } from '../../constants';

// eslint-disable-next-line
const RoutePreferencesSection = (
  { optimize, defaultSettings },
  { intl, router },
) => (
  <div className="route-preferences-container">
    <h1>
      {intl.formatMessage({
        id: 'route-preferences',
      })}
    </h1>
    {/* TODO: to be implemented when OTP/OSM support is available 
    <Checkbox
      defaultMessage="Prefer paved routes"
      labelId="route-prefer-paved"
      onChange={e => console.log(e.target)}
    /> */}
    <Checkbox
      checked={optimize === OptimizeType.Greenways}
      defaultMessage="Prefer cycleways"
      labelId="route-prefer-greenways"
      onChange={e =>
        replaceQueryParams(router, {
          optimize: e.target.checked
            ? OptimizeType.Greenways
            : defaultSettings.optimize,
        })
      }
    />
    {/* TODO: to be implemented when OTP/OSM support is available
    <Checkbox
      defaultMessage="Prefer routes with winter maintenance"
      labelId="route-prefer-winter-maintenance"
      onChange={e => console.log(e.target)}
    /> */}
    {/* TODO: to be implemented when OTP/OSM support is available 
    <Checkbox
      defaultMessage="Prefer illuminated routes"
      labelId="route-prefer-illuminated"
      onChange={e => console.log(e.target)}
    /> */}
  </div>
);

const optimizeShape = PropTypes.oneOf([
  OptimizeType.Flat,
  OptimizeType.Greenways,
  OptimizeType.Quick,
  OptimizeType.Safe,
]);

RoutePreferencesSection.propTypes = {
  defaultSettings: PropTypes.shape({ optimize: optimizeShape.isRequired })
    .isRequired,
  optimize: optimizeShape.isRequired,
};

RoutePreferencesSection.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  router: routerShape.isRequired,
};

export default RoutePreferencesSection;
