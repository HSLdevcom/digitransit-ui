import PropTypes from 'prop-types';
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { routerShape } from 'react-router';
import { dtLocationShape } from '../util/shapes';
import { getPathWithEndpointObjects } from '../util/path';
import Icon from './Icon';
import { getIcon } from '../util/suggestionUtils';
import GeopositionSelector from './GeopositionSelector';

const OriginSelectorRow = ({ icon, label, onClick }) => (
  <li>
    <button className="noborder" style={{ display: 'block' }} onClick={onClick}>
      <Icon className={`splash-icon ${icon}`} img={icon} />
      {label}
    </button>
  </li>
);

OriginSelectorRow.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

const OriginSelector = (
  { favourites, oldSearches, destination, origin },
  { config, router },
) => {
  const setOrigin = newOrigin => {
    const url = getPathWithEndpointObjects(newOrigin, destination);
    if (origin.isSet === false) {
      router.replace(url);
    } else {
      router.push(url);
    }
  };

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
        onClick={() => {
          setOrigin({ ...f, address: f.locationName });
        }}
        label={f.locationName}
      />
    ))
    .concat(
      oldSearches.filter(notInFavourites).map(s => (
        <OriginSelectorRow
          key={`o-${s.properties.label || s.properties.name}`}
          icon={getIcon(s.properties.layer)}
          label={s.properties.label || s.properties.name}
          onClick={() => {
            setOrigin({
              lat:
                (s.geometry &&
                  s.geometry.coordinates &&
                  s.geometry.coordinates[1]) ||
                s.lat,
              lon:
                (s.geometry &&
                  s.geometry.coordinates &&
                  s.geometry.coordinates[0]) ||
                s.lon,
              address: s.properties.label || s.properties.name,
            });
          }}
        />
      )),
    )
    .concat(
      config.defaultOrigins.map(o => (
        <OriginSelectorRow key={`o-${o.label}`} onClick={setOrigin} /> // TODO object format
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
  destination: dtLocationShape.isRequired,
  origin: dtLocationShape.isRequired,
};

OriginSelector.contextTypes = {
  config: PropTypes.object.isRequired,
  router: routerShape.isRequired,
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
