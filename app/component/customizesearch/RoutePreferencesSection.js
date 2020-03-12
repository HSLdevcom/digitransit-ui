import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { matchShape, routerShape } from 'found';

import Checkbox from '../Checkbox';
import {
  getPreferGreenways,
  setPreferGreenways,
  resetPreferGreenways,
  getAvoidElevationChanges,
  setAvoidElevationChanges,
  resetAvoidElevationChanges,
} from '../../util/queryUtils';
import { OptimizeType } from '../../constants';

const RoutePreferencesSection = (
  { optimize, triangleFactors, defaultSettings },
  { intl, router, match },
) => {
  const isAvoidElevationChangesChecked = getAvoidElevationChanges(
    optimize,
    triangleFactors,
  );
  const avoidElevationChangesOnChange = e =>
    e.target.checked
      ? setAvoidElevationChanges(router, match, optimize, triangleFactors)
      : resetAvoidElevationChanges(
          router,
          match,
          optimize,
          triangleFactors,
          defaultSettings.optimize,
        );

  const isPreferGreenwaysChecked = getPreferGreenways(
    optimize,
    triangleFactors,
  );
  const preferGreenwaysOnChange = e =>
    e.target.checked
      ? setPreferGreenways(router, match, optimize, triangleFactors)
      : resetPreferGreenways(
          router,
          match,
          optimize,
          triangleFactors,
          defaultSettings.optimize,
        );

  return (
    <div className="route-preferences-container">
      <h1>
        {intl.formatMessage({
          id: 'route-preferences',
        })}
      </h1>
      <Checkbox
        checked={isAvoidElevationChangesChecked}
        defaultMessage=""
        labelId="route-least-elevation-changes"
        onChange={avoidElevationChangesOnChange}
      />
      <Checkbox
        checked={isPreferGreenwaysChecked}
        defaultMessage="Prefer cycleways"
        labelId="route-prefer-greenways"
        onChange={preferGreenwaysOnChange}
      />
      {/* TODO: to be implemented when OTP/OSM support is available 
    <Checkbox
      defaultMessage="Prefer paved routes"
      labelId="route-prefer-paved"
      onChange={e => console.log(e.target)}
    /> */}
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
};

const optimizeShape = PropTypes.oneOf([
  OptimizeType.Flat,
  OptimizeType.Greenways,
  OptimizeType.Quick,
  OptimizeType.Safe,
  OptimizeType.Triangle,
]);

RoutePreferencesSection.propTypes = {
  defaultSettings: PropTypes.shape({ optimize: optimizeShape.isRequired })
    .isRequired,
  optimize: optimizeShape.isRequired,
  triangleFactors: PropTypes.shape({
    safetyFactor: PropTypes.number,
    slopeFactor: PropTypes.number,
    timeFactor: PropTypes.number,
  }).isRequired,
};

RoutePreferencesSection.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  router: routerShape.isRequired,
  match: matchShape.isRequired,
};

export default RoutePreferencesSection;
