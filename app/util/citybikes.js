import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';
import without from 'lodash/without';
import { getCustomizedSettings } from '../store/localStorage';
import { addAnalyticsEvent } from './analyticsUtils';
import { showCitybikeNetwork } from './modeUtils';

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

export const getCityBikeNetworkIcon = (
  networkConfig = defaultNetworkConfig,
  disabled,
) => `icon-icon_${networkConfig.icon || 'citybike'}${disabled ? '_off' : ''}`;

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
  Object.entries(config.cityBike.networks).forEach(n => {
    if (showCitybikeNetwork(n[1])) {
      mappedNetworks.push(n[0]);
    }
  });
  return mappedNetworks;
};

export const mapDefaultNetworkProperties = config => {
  const mappedNetworks = [];
  Object.keys(config.cityBike.networks).forEach(key => {
    if (showCitybikeNetwork(config.cityBike.networks[key])) {
      mappedNetworks.push({
        networkName: key,
        ...config.cityBike.networks[key],
      });
    }
  });
  return mappedNetworks;
};

export const getCitybikeCapacity = (config, network = undefined) => {
  return (
    config.cityBike?.networks[network]?.capacity || config.cityBike.capacity
  );
};
/**
 * Retrieves all chosen citybike networks from the
 * localstorage or default configuration.
 *
 * @param {*} config The configuration for the software installation
 */

export const getCitybikeNetworks = config => {
  const { allowedBikeRentalNetworks } = getCustomizedSettings();
  if (
    Array.isArray(allowedBikeRentalNetworks) &&
    !isEmpty(allowedBikeRentalNetworks)
  ) {
    return allowedBikeRentalNetworks;
  }
  return getDefaultNetworks(config);
};

const addAnalytics = (action, name) => {
  addAnalyticsEvent({
    category: 'ItinerarySettings',
    action,
    name,
  });
};

/** *
 * Updates the list of allowed citybike networks either by removing or adding.
 * Note: legacy settings had network names always in uppercase letters.
 *
 * @param currentSettings the current settings
 * @param newValue the network to be added/removed
 * @param config The configuration for the software installation
 * @param isUsingCitybike if citybike is enabled
 * @returns the updated citybike networks
 */

export const updateCitybikeNetworks = (
  currentSettings,
  newValue,
  config,
  isUsingCitybike,
) => {
  let chosenNetworks;

  if (isUsingCitybike) {
    chosenNetworks = currentSettings.find(
      o => o.toLowerCase() === newValue.toLowerCase(),
    )
      ? without(currentSettings, newValue, newValue.toUpperCase())
      : currentSettings.concat([newValue]);
  } else {
    chosenNetworks = [newValue];
  }

  if (chosenNetworks.length === 0 || !isUsingCitybike) {
    if (chosenNetworks.length === 0) {
      addAnalytics('SettingsResetCityBikeNetwork', null);
      return getDefaultNetworks(config);
    }
    addAnalytics('SettingsNotUsingCityBikeNetwork', null);
    return chosenNetworks;
  }

  if (Array.isArray(currentSettings) && Array.isArray(chosenNetworks)) {
    const action = `Settings${
      currentSettings.length > chosenNetworks.length ? 'Disable' : 'Enable'
    }CityBikeNetwork`;
    addAnalytics(action, newValue);
  }
  return chosenNetworks;
};

export const getCityBikeMinZoomOnStopsNearYou = (config, override) => {
  if (override && config.cityBike.minZoomStopsNearYou) {
    return config.cityBike.minZoomStopsNearYou;
  }
  return config.cityBike.cityBikeMinZoom;
};
