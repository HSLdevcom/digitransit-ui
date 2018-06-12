import PropTypes from 'prop-types';
import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { routerShape } from 'react-router';
import { dtLocationShape } from '../util/shapes';
import { navigateTo, TAB_NEARBY } from '../util/path';
import { isBrowser } from '../util/browser';
import OriginSelectorRow from './OriginSelectorRow';
import { suggestionToLocation, getIcon } from '../util/suggestionUtils';
import GeopositionSelector from './GeopositionSelector';

const OriginSelector = (
  { favouriteLocations, favouriteStops, oldSearches, destination, origin, tab },
  { config, router },
) => {
  const setOrigin = newOrigin => {
    navigateTo({
      origin: { ...newOrigin, ready: true },
      destination,
      context: '/',
      router,
      base: {},
      tab,
    });
  };

  const notInFavouriteLocations = item =>
    favouriteLocations.filter(
      favourite =>
        item.geometry &&
        item.geometry.coordinates &&
        Math.abs(favourite.lat - item.geometry.coordinates[1]) < 1e-4 &&
        Math.abs(favourite.lon - item.geometry.coordinates[0]) < 1e-4,
    ).length === 0;

  const notInFavouriteStops = item =>
    favouriteStops.filter(
      favourite =>
        item.geometry &&
        item.geometry.coordinates &&
        Math.abs(favourite.lat - item.geometry.coordinates[1]) < 1e-4 &&
        Math.abs(favourite.lon - item.geometry.coordinates[0]) < 1e-4,
    ).length === 0;

  const isGeocodingResult = item => item.geometry && item.properties;

  // React doesn't anymore compare all elements rendered on server side to
  // those rendered on client side. Thanks to this fav icons aren't patched
  // and icons of default locations are shown. So don't render those on
  // server side.
  const names = !isBrowser
    ? []
    : favouriteLocations
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
          favouriteStops.map(f => (
            <OriginSelectorRow
              key={`f-${f.locationName}`}
              icon={getIcon('favourite')}
              onClick={() => {
                setOrigin({ ...f, address: f.locationName });
              }}
              label={f.locationName}
            />
          )),
        )
        .concat(
          oldSearches
            .filter(isGeocodingResult)
            .filter(notInFavouriteLocations)
            .filter(notInFavouriteStops)
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
      <GeopositionSelector
        destination={destination}
        origin={origin}
        tab={tab}
      />
      {names.slice(0, 3)}
    </ul>
  );
};

OriginSelector.propTypes = {
  favouriteLocations: PropTypes.array.isRequired,
  favouriteStops: PropTypes.array.isRequired,
  oldSearches: PropTypes.array.isRequired,
  destination: dtLocationShape.isRequired,
  origin: dtLocationShape.isRequired,
  tab: PropTypes.string,
};
OriginSelector.defaultProps = {
  tab: TAB_NEARBY,
};

OriginSelector.contextTypes = {
  config: PropTypes.object.isRequired,
  router: routerShape.isRequired,
};

export default connectToStores(
  OriginSelector,
  ['FavouriteLocationStore', 'FavouriteStopsStore', 'OldSearchesStore'],
  context => ({
    favouriteLocations: context
      .getStore('FavouriteLocationStore')
      .getLocations(),
    favouriteStops: context.getStore('FavouriteStopsStore').getStops(),
    oldSearches: context
      .getStore('OldSearchesStore')
      .getOldSearches('endpoint'),
  }),
);
