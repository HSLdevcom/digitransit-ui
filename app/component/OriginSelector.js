import PropTypes from 'prop-types';
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { routerShape, locationShape } from 'react-router';

import { setEndpoint } from '../action/EndpointActions';
import Icon from './Icon';
import { getIcon } from '../util/suggestionUtils';
import GeopositionSelector from './GeopositionSelector';

const OriginSelectorRow = (
  { icon, label, lat, lon },
  { executeAction, router, location },
) => (
  <li>
    <button
      className="noborder"
      style={{ display: 'block' }}
      onClick={() =>
        executeAction(setEndpoint, {
          target: 'origin',
          endpoint: { lat, lon, address: label },
          router,
          location,
        })}
    >
      <Icon className={`splash-icon ${icon}`} img={icon} />
      {label}
    </button>
  </li>
);

OriginSelectorRow.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  lat: PropTypes.number.isRequired,
  lon: PropTypes.number.isRequired,
};

OriginSelectorRow.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  router: routerShape.isRequired,
  location: locationShape.isRequired,
};

const OriginSelector = ({ favourites, oldSearches }, { config }) => {
  const notInFavourites = item =>
    favourites.filter(
      favourite =>
        item.geometry &&
        Math.abs(favourite.lat - item.geometry.coordinates[1]) < 1e-4 &&
        Math.abs(favourite.lon - item.geometry.coordinates[0]) < 1e-4,
    ).length === 0;

  const names = favourites
    .map(f => (
      <OriginSelectorRow
        key={`f-${f.locationName}`}
        icon={getIcon('favourite')}
        label={f.locationName}
        lat={f.lat}
        lon={f.lon}
      />
    ))
    .concat(
      oldSearches
        .filter(notInFavourites)
        .map(s => (
          <OriginSelectorRow
            key={`o-${s.properties.label || s.properties.name}`}
            icon={getIcon(s.properties.layer)}
            label={s.properties.label || s.properties.name}
            lat={
              (s.geometry &&
                s.geometry.coordinates &&
                s.geometry.coordinates[1]) ||
              s.lat
            }
            lon={
              (s.geometry &&
                s.geometry.coordinates &&
                s.geometry.coordinates[0]) ||
              s.lon
            }
          />
        )),
    )
    .concat(
      config.defaultOrigins.map(o => (
        <OriginSelectorRow key={`o-${o.label}`} {...o} />
      )),
    );

  return (
    <ul>
      <GeopositionSelector searchModalIsOpen={false} />
      {names.slice(0, 2)}
    </ul>
  );
};

OriginSelector.propTypes = {
  favourites: PropTypes.array.isRequired,
  oldSearches: PropTypes.array.isRequired,
};

OriginSelector.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default connectToStores(
  OriginSelector,
  ['FavouriteLocationStore', 'OldSearchesStore'],
  context => ({
    favourites: context.getStore('FavouriteLocationStore').getLocations(),
    oldSearches: context
      .getStore('OldSearchesStore')
      .getOldSearches('endpoint'),
  }),
);
