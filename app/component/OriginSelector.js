import PropTypes from 'prop-types';
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { routerShape } from 'react-router';
import { dtLocationShape } from '../util/shapes';
import { getPathWithEndpointObjects } from '../util/path';
import OriginSelectorRow from './OriginSelectorRow';
import { suggestionToLocation, getIcon } from '../util/suggestionUtils';
import GeopositionSelector from './GeopositionSelector';

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

  const isGeocodingResult = item => item.geometry && item.properties;

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
      oldSearches
        .filter(isGeocodingResult)
        .filter(notInFavourites)
        .map(s => (
          <OriginSelectorRow
            key={`o-${s.properties.label || s.properties.name}`}
            icon={getIcon(s.properties.layer)}
            label={s.properties.label || s.properties.name}
            onClick={() => {
              setOrigin(suggestionToLocation(s));
            }}
          />
        )),
    )
    .concat(
      config.defaultOrigins.map(o => (
        <OriginSelectorRow
          key={`o-${o.label}`}
          icon={o.icon}
          label={o.label}
          onClick={() => {
            setOrigin({ ...o, address: o.label });
          }}
        />
      )),
    );

  return (
    <ul>
      <GeopositionSelector origin={origin} />
      {names.slice(0, 3)}
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
