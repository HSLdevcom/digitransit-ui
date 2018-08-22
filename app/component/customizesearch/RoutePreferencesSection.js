import React from 'react';
import { intlShape } from 'react-intl';

import Checkbox from '../Checkbox';

const getRoutePreferences = () => [
  {
    name: 'route-prefer-paved',
    defaultMessage: 'Prefer paved routes',
  },
  {
    name: 'route-prefer-greenways',
    defaultMessage: 'Prefer cycleways',
  },
  {
    name: 'route-prefer-winter-maintenance',
    defaultMessage: 'Prefer routes with winter maintenance',
  },
  {
    name: 'route-prefer-illuminated',
    defaultMessage: 'Prefer illuminated routes',
  },
];

// eslint-disable-next-line
const RoutePreferencesSection = ({}, { intl }) => (
  <div className="route-preferences-container">
    <h1>
      {intl.formatMessage({
        id: 'route-preferences',
      })}
    </h1>
    {getRoutePreferences().map(o => (
      <Checkbox
        checked={false}
        defaultMessage={o.defaultMessage}
        key={`cb-${o.name}`}
        labelId={o.name}
        onChange={e => console.log(e.target)}
      />
    ))}
  </div>
);

RoutePreferencesSection.contextTypes = {
  intl: intlShape.isRequired,
};

export default RoutePreferencesSection;
