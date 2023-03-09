import isString from 'lodash/isString';
import isEmpty from 'lodash/isEmpty';
import without from 'lodash/without';
import { getCustomizedSettings } from '../store/localStorage';
import { addAnalyticsEvent } from './analyticsUtils';
import { citybikeRoutingIsActive } from './modeUtils';

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
  const id = networkId;
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
  Object.entries(config.cityBike.networks).forEach(([id, network]) => {
    if (citybikeRoutingIsActive(network)) {
      mappedNetworks.push(id);
    }
  });
  return mappedNetworks;
};

export const mapDefaultNetworkProperties = config => {
  const mappedNetworks = [];
  Object.keys(config.cityBike.networks).forEach(key => {
    if (citybikeRoutingIsActive(config.cityBike.networks[key])) {
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
 * localstorage
 *
 * @param {*} config The configuration for the software installation
 */

export const getCitybikeNetworks = config => {
  const { allowedVehicleRentalNetworks } = getCustomizedSettings();
  if (
    Array.isArray(allowedVehicleRentalNetworks) &&
    !isEmpty(allowedVehicleRentalNetworks)
  ) {
    return allowedVehicleRentalNetworks;
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

export const updateCitybikeNetworks = (currentSettings, newValue) => {
  let chosenNetworks;

  if (currentSettings) {
    chosenNetworks = currentSettings.find(
      o => o.toLowerCase() === newValue.toLowerCase(),
    )
      ? // Not only remove uppercased network, but also lowercased network
        without(
          currentSettings,
          newValue,
          newValue.toUpperCase(),
          newValue.toLowerCase(),
        )
      : currentSettings.concat([newValue]);
  } else {
    chosenNetworks = [newValue];
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

/** *
 * Checks if stationId is a number. We don't want to display random hashes or names.
 *
 * @param bikeRentalStation bike rental station from OTP
 */
export const hasStationCode = bikeRentalStation => {
  return (
    bikeRentalStation &&
    bikeRentalStation.stationId &&
    // eslint-disable-next-line no-restricted-globals
    !isNaN(bikeRentalStation.stationId) &&
    // eslint-disable-next-line no-restricted-globals
    !isNaN(parseFloat(bikeRentalStation.stationId))
  );
};
