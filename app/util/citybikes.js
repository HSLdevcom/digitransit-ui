import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';
import without from 'lodash/without';
import { toggleCitybikesAndNetworks } from './modeUtils';
import { getCustomizedSettings } from '../store/localStorage';
import { replaceQueryParams } from './queryUtils';

export const BIKESTATION_ON = 'Station on';
export const BIKESTATION_OFF = 'Station off';
export const BIKESTATION_CLOSED = 'Station closed';

export const BIKEAVL_UNKNOWN = 'No availability';
export const BIKEAVL_BIKES = 'Bikes on station';
export const BIKEAVL_WITHMAX = 'Bikes and capacity';

/**
 * CityBikeNetworkType depicts different types of citybike networks.
 */
export const CityBikeNetworkType = {
  /** The network uses bikes. */
  CityBike: 'citybike',
  /** The network uses scooters. */
  Scooter: 'scooter',
};

export const defaultNetworkConfig = {
  icon: 'citybike',
  name: {},
  type: CityBikeNetworkType.CityBike,
};

export const getCityBikeNetworkName = (
  networkConfig = defaultNetworkConfig,
  language = 'en',
) => (networkConfig.name && networkConfig.name[language]) || undefined;

export const getCityBikeNetworkIcon = (networkConfig = defaultNetworkConfig) =>
  `icon-icon_${networkConfig.icon || 'citybike'}`;

export const getCityBikeNetworkId = networks => {
  if (isString(networks) && networks.length > 0) {
    return networks;
  }
  if (!Array.isArray(networks) || networks.length === 0) {
    return undefined;
  }
  return networks[0];
};

export const getCityBikeNetworkConfig = (networkId, config) => {
  if (!networkId || !networkId.toLowerCase) {
    return defaultNetworkConfig;
  }
  const id = networkId.toLowerCase();
  if (
    config &&
    config.cityBike &&
    config.cityBike.networks &&
    config.cityBike.networks[id] &&
    Object.keys(config.cityBike.networks[id]).length > 0
  ) {
    return config.cityBike.networks[id];
  }
  return defaultNetworkConfig;
};

export const getDefaultNetworks = config => {
  const mappedNetworks = [];
  Object.keys(config.cityBike.networks).forEach(key =>
    mappedNetworks.push(key.toUpperCase()),
  );
  return mappedNetworks;
};

export const mapDefaultNetworkProperties = config => {
  const mappedNetworks = [];
  Object.keys(config.cityBike.networks).forEach(key =>
    mappedNetworks.push({ networkName: key, ...config.cityBike.networks[key] }),
  );
  return mappedNetworks;
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
 * @param isUsingCitybike if citybike is enabled
 */

export const updateCitybikeNetworks = (
  currentSettings,
  newValue,
  config,
  router,
  isUsingCitybike,
) => {
  const mappedcurrentSettings = currentSettings.map(o => o.toUpperCase());

  let chosenNetworks;

  if (isUsingCitybike) {
    chosenNetworks = mappedcurrentSettings.find(o => o === newValue)
      ? without(mappedcurrentSettings, newValue)
      : mappedcurrentSettings.concat([newValue]);
  } else {
    chosenNetworks = [newValue];
  }

  if (chosenNetworks.length === 0 || !isUsingCitybike) {
    if (chosenNetworks.length === 0) {
      toggleCitybikesAndNetworks(
        'citybike',
        config,
        router,
        getDefaultNetworks(config).join(),
      );
      return;
    }
    toggleCitybikesAndNetworks(
      'citybike',
      config,
      router,
      chosenNetworks.join(','),
    );
    return;
  }

  replaceQueryParams(router, {
    allowedBikeRentalNetworks: chosenNetworks.join(','),
  });
};

// Returns network specific url if it exists. Defaults to cityBike.useUrl
export const getCityBikeUrl = (networks, lang, config) => {
  const id = getCityBikeNetworkId(networks).toLowerCase();

  if (
    config &&
    config.cityBike &&
    config.cityBike.networks &&
    config.cityBike.networks[id] &&
    config.cityBike.networks[id].url &&
    config.cityBike.networks[id].url[lang]
  ) {
    return config.cityBike.networks[id].url[lang];
  }
  return undefined;
};

// Returns network specific type if it exists. Defaults to citybike
export const getCityBikeType = (networks, config) => {
  const id = getCityBikeNetworkId(networks).toLowerCase();

  if (
    config &&
    config.cityBike &&
    config.cityBike.networks &&
    config.cityBike.networks[id] &&
    config.cityBike.networks[id].type
  ) {
    return config.cityBike.networks[id].type;
  }
  return defaultNetworkConfig.type;
};
