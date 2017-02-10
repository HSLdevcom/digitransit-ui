import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { routerShape, locationShape } from 'react-router';

import { setEndpoint } from '../action/EndpointActions';
import Icon from './Icon';
import { getIcon } from '../util/suggestionUtils';

const OriginSelectorRow = ({ icon, label, lat, lon }, { executeAction, router, location }) => (
  <li>
    <button
      className="noborder"
      style={{ display: 'block' }}
      onClick={() => executeAction(setEndpoint, {
        target: 'origin',
        endpoint: { lat, lon, address: label },
        router,
        location,
      })}
    >
      <Icon className={`splash-icon ${icon}`} img={icon} />
      { label }
    </button>
  </li>
);

OriginSelectorRow.propTypes = {
  icon: React.PropTypes.string.isRequired,
  label: React.PropTypes.string.isRequired,
  lat: React.PropTypes.number.isRequired,
  lon: React.PropTypes.number.isRequired,
};

OriginSelectorRow.contextTypes = {
  executeAction: React.PropTypes.func.isRequired,
  router: routerShape.isRequired,
  location: locationShape.isRequired,
};

const OriginSelector = ({ favourites, oldSearches }, { config }) => {
  const names = favourites.map(
      f => <OriginSelectorRow
        key={`f-${f.locationName}`}
        icon={getIcon('favourite')}
        label={f.locationName}
        lat={f.lat}
        lon={f.lon}
      />)
      .concat(oldSearches.map(s => <OriginSelectorRow
        key={`o-${s.properties.label}`}
        icon={getIcon(s.properties.layer)}
        label={s.properties.label}
        lat={s.geometry.coordinates[1]}
        lon={s.geometry.coordinates[0]}
      />))
      .concat(config.defaultOrigins.map(o => <OriginSelectorRow key={`o-${o.label}`} {...o} />));
  return <ul>{names.slice(0, 3)}</ul>;
};

OriginSelector.propTypes = {
  favourites: React.PropTypes.array.isRequired,
  oldSearches: React.PropTypes.array.isRequired,
};

OriginSelector.contextTypes = {
  config: React.PropTypes.object.isRequired,
};

export default connectToStores(
  OriginSelector,
  ['FavouriteLocationStore', 'OldSearchesStore'],
  context => (
    {
      favourites: context.getStore('FavouriteLocationStore').getLocations(),
      oldSearches: context.getStore('OldSearchesStore').getOldSearches('endpoint'),
    }
  ));
