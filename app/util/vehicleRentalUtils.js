import isString from 'lodash/isString';
import without from 'lodash/without';
import { getCustomizedSettings } from '../store/localStorage';
import { addAnalyticsEvent } from './analyticsUtils';
import { networkIsActive } from './modeUtils';
import { getIdWithoutFeed } from './feedScopedIdUtils';
import { isAndroid, isIOS } from './browser';

export const BIKEAVL_UNKNOWN = 'No availability';
export const BIKEAVL_BIKES = 'Bikes on station';
export const BIKEAVL_WITHMAX = 'Bikes and capacity';

/**
 * RentalNetworkType depicts different types of citybike networks.
 */
export const RentalNetworkType = {
  /** The network uses bikes. */
  CityBike: 'citybike',
  /** The network uses scooters. */
  Scooter: 'scooter',
};

export const defaultNetworkConfig = {
  icon: 'citybike',
  name: {},
  type: RentalNetworkType.CityBike,
};

export const getRentalNetworkName = (
  networkConfig = defaultNetworkConfig,
  language = 'en',
) => (networkConfig.name && networkConfig.name[language]) || undefined;

export const getRentalNetworkIcon = (
  networkConfig = defaultNetworkConfig,
  disabled = false,
) => `icon-icon_${networkConfig.icon || 'citybike'}${disabled ? '_off' : ''}`;

export const getRentalNetworkId = networks => {
  if (isString(networks) && networks.length > 0) {
    return networks;
  }
  if (!Array.isArray(networks) || networks.length === 0) {
    return undefined;
  }
  return networks[0];
};

export const getRentalNetworkConfig = (networkId, config) => {
  if (!networkId || !networkId.toLowerCase) {
    return defaultNetworkConfig;
  }
  const id = networkId.toLowerCase();
  if (
    config.cityBike?.networks?.[id] &&
    Object.keys(config.cityBike.networks[id]).length > 0
  ) {
    return config.cityBike.networks[id];
  }
  return defaultNetworkConfig;
};

export const getDefaultNetworks = config => {
  const mappedNetworks = [];
  Object.entries(config.cityBike.networks).forEach(n => {
    if (
      networkIsActive(n[1]) &&
      n[1]?.type !== RentalNetworkType.Scooter // scooter networks are never on by default
    ) {
      mappedNetworks.push(n[0]);
    }
  });
  return mappedNetworks;
};

export const getAllNetworksOfType = (config, type) => {
  const mappedNetworks = [];
  Object.entries(config.cityBike.networks).forEach(n => {
    if (n[1].type.toLowerCase() === type.toLowerCase()) {
      mappedNetworks.push(n[0]);
    }
  });
  return mappedNetworks;
};

export const mapDefaultNetworkProperties = config => {
  const mappedNetworks = [];
  Object.keys(config.cityBike.networks).forEach(key => {
    if (networkIsActive(config.cityBike.networks[key])) {
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

export const getCitybikeNetworks = () => {
  const { allowedBikeRentalNetworks } = getCustomizedSettings();
  return allowedBikeRentalNetworks || [];
};

export const getScooterNetworks = () => {
  const { allowedScooterRentalNetworks } = getCustomizedSettings();
  return allowedScooterRentalNetworks || [];
};

const addAnalytics = (action, name) => {
  addAnalyticsEvent({
    category: 'ItinerarySettings',
    action,
    name,
  });
};

/** *
 * Updates the list of allowed networks either by removing or adding.
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
 * Checks if rentalId (station or vehicle) is a number. We don't want to display random hashes or names.
 *
 * @param rentalId id of a rental station or rental vehicle from OTP
 */
export const hasVehicleRentalCode = rentalId => {
  const id = rentalId?.split(':')[1];
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

export const getRentalVehicleLink = (rentalVehicle, network, networkConfig) => {
  if (!networkConfig || !rentalVehicle) {
    return null;
  }

  const { ios, android, web } = rentalVehicle?.rentalUris || {};

  if (isIOS && ios?.startsWith(`${network}://`)) {
    return ios;
  }

  if (isAndroid && android?.startsWith(`${network}://`)) {
    return android;
  }

  if (web?.includes(network)) {
    return web;
  }

  if (rentalVehicle?.vehicleRentalSystem?.url?.includes(network)) {
    return rentalVehicle.vehicleRentalSystem.url;
  }

  return null;
};
