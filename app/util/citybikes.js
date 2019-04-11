import { isEmpty, without } from 'lodash';
import { toggleTransportMode } from './modeUtils';
import { getCustomizedSettings } from '../store/localStorage';
import { replaceQueryParams } from './queryUtils';

export const BIKESTATION_ON = 'Station on';
export const BIKESTATION_OFF = 'Station off';
export const BIKESTATION_CLOSED = 'Station closed';

// Needs config for citybike network names
export const getCityBikeNetworkName = (network, config) => {
  return config.citybikeModes.find(
    o => o.networkName.toLowerCase() === network.toLowerCase(),
  );
};

export const getDefaultNetworks = config => {
  return config.citybikeModes.map(mode => mode.networkName.toUpperCase());
};

/**
 * Retrieves all chosen citybike networks from the URI,
 * localstorage or default configuration.
 *
 * @param {*} location The current location
 * @param {*} config The configuration for the software installation
 */

export const getCitybikeNetworks = (location, config) => {
  if (location && location.query && location.query.allowedBikeRentalNetworks) {
    return decodeURI(location.query.allowedBikeRentalNetworks)
      .split('?')[0]
      .split(',')
      .map(m => m.toUpperCase());
  }
  const { allowedBikeRentalNetworks } = getCustomizedSettings();
  if (
    Array.isArray(allowedBikeRentalNetworks) &&
    !isEmpty(allowedBikeRentalNetworks)
  ) {
    return allowedBikeRentalNetworks;
  }
  return getDefaultNetworks(config);
};

/** *
 * Updates the list of allowed citybike networks either by removing or adding
 *
 * @param currentSettings the current settings
 * @param newValue the network to be added/removed
 * @param config The configuration for the software installation
 * @param router the router
 */

export const updateCitybikeNetworks = (
  currentSettings,
  newValue,
  config,
  router,
) => {
  const mappedcurrentSettings = currentSettings.allowedBikeRentalNetworks.map(
    o => o.toUpperCase(),
  );

  const chosenNetworks = mappedcurrentSettings.find(
    o => o === newValue.toUpperCase(),
  )
    ? without(mappedcurrentSettings, newValue.toUpperCase())
    : mappedcurrentSettings.concat([newValue.toUpperCase()]);
  if (
    chosenNetworks.length === 0 ||
    (currentSettings.allowedBikeRentalNetworks.length === 0 && newValue)
  ) {
    toggleTransportMode('citybike', config, router);
    if (chosenNetworks.length === 0) {
      replaceQueryParams(router, {
        allowedBikeRentalNetworks: getDefaultNetworks(config).join(),
      });
      return;
    }
  }
  replaceQueryParams(router, {
    allowedBikeRentalNetworks: chosenNetworks.join(),
  });
};
