import isString from 'lodash/isString';
import without from 'lodash/without';
import { getCustomizedSettings } from '../store/localStorage';
import { addAnalyticsEvent } from './analyticsUtils';
import { citybikeRoutingIsActive } from './modeUtils';
import { getIdWithoutFeed } from './feedScopedIdUtils';

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

export const getVehicleRentalStationNetworkName = (
  networkConfig = defaultNetworkConfig,
  language = 'en',
) => (networkConfig.name && networkConfig.name[language]) || undefined;

export const getVehicleRentalStationNetworkIcon = (
  networkConfig = defaultNetworkConfig,
  disabled = false,
) => `icon-icon_${networkConfig.icon || 'citybike'}${disabled ? '_off' : ''}`;

export const getVehicleRentalStationNetworkId = networks => {
  if (isString(networks) && networks.length > 0) {
    return networks;
  }
  if (!Array.isArray(networks) || networks.length === 0) {
    return undefined;
  }
  return networks[0];
};

export const getVehicleRentalStationNetworkConfig = (networkId, config) => {
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
    if (citybikeRoutingIsActive(n[1], config)) {
      mappedNetworks.push(n[0]);
    }
  });
  return mappedNetworks;
};

export const mapDefaultNetworkProperties = config => {
  const mappedNetworks = [];
  Object.keys(config.cityBike.networks).forEach(key => {
    if (citybikeRoutingIsActive(config.cityBike.networks[key], config)) {
      mappedNetworks.push({
        networkName: key,
        ...config.cityBike.networks[key],
      });
    }
  });
  return mappedNetworks;
};

export const getVehicleCapacity = (config, network = undefined) => {
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

export const getVehicleRentalStationNetworks = () => {
  const { allowedBikeRentalNetworks } = getCustomizedSettings();
  return allowedBikeRentalNetworks || [];
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

export const updateVehicleNetworks = (currentSettings, newValue) => {
  let chosenNetworks;

  if (currentSettings) {
    chosenNetworks = currentSettings.find(
      o => o.toLowerCase() === newValue.toLowerCase(),
    )
      ? without(currentSettings, newValue, newValue.toUpperCase())
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

export const getVehicleMinZoomOnStopsNearYou = (config, override) => {
  if (override && config.cityBike.minZoomStopsNearYou) {
    return config.cityBike.minZoomStopsNearYou;
  }
  return config.cityBike.cityBikeMinZoom;
};

/** *
 * Checks if stationId is a number. We don't want to display random hashes or names.
 *
 * @param vehicleRentalStation bike rental station from OTP
 */
export const hasStationCode = vehicleRentalStation => {
  const id = vehicleRentalStation.stationId.split(':')[1];
  return (
    id &&
    // eslint-disable-next-line no-restricted-globals
    !isNaN(id) &&
    // eslint-disable-next-line no-restricted-globals
    !isNaN(parseFloat(id))
  );
};

export const mapVehicleRentalFromStore = vehicleRentalStation => {
  const network = vehicleRentalStation.networks[0];
  const newStation = {
    ...vehicleRentalStation,
    network,
    stationId: `${network}:${vehicleRentalStation.stationId}`,
  };
  delete newStation.networks;
  return newStation;
};

export const mapVehicleRentalToStore = vehicleRentalStation => {
  const { network } = vehicleRentalStation;
  const newStation = {
    ...vehicleRentalStation,
    networks: [network],
    stationId: getIdWithoutFeed(vehicleRentalStation.stationId),
  };
  delete newStation.network;
  return newStation;
};
