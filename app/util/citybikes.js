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

export const DEFAULT_OPERATOR = 'other';
export const DEFAULT_FORM_FACTOR = 'bicycle';

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
  // TODO rename to activeNetworksIds
  const mappedNetworks = [];
  Object.entries(config.cityBike.networks).forEach(([id, network]) => {
    if (citybikeRoutingIsActive(network)) {
      mappedNetworks.push(id);
    }
  });
  return mappedNetworks;
};

export const getRentalNetworkIconAndColors = (
  networkId,
  formFactors,
  config,
) => {
  const networkConfig = getCityBikeNetworkConfig(networkId, config);
  // TODO HB<->LE: in which cases does OTP return multiple FormFactors? and when none?
  const formFactor =
    formFactors === undefined || formFactors.indexOf(',') > 0
      ? (networkConfig.form_factors || ['bicycle'])[0]
      : formFactors.toLowerCase();
  const operatorConfig =
    config.cityBike.operators[networkConfig.operator || 'other'];
  const colors = networkConfig.colors || operatorConfig?.colors;
  if (colors === undefined) {
    // eslint-disable-next-line no-console
    console.error(
      `Neither network.colors not operator.colors configuration for ${networkId} (operator ${networkConfig.operator} )`,
    );
  }
  return {
    iconName: networkId.includes('taxi')
      ? `icon-icon_taxi`
      : `icon-icon_${formFactor}`,
    bgColor: colors?.background || config.colors.iconColors['mode-citybike'],
    fgColor: colors?.foreground || '#fff',
  };
};

/**
 * Returns true, if networkConfig.form_factors includes formFactor
 */
const isRentingFormFactor = (networkConfig, formFactor) => {
  return networkConfig.form_factors
    ? networkConfig.form_factors.includes(formFactor)
    : formFactor === DEFAULT_FORM_FACTOR;
};

export const mapDefaultNetworkProperties = (
  config,
  formFactor = DEFAULT_FORM_FACTOR,
) => {
  const mappedNetworks = [];
  // TODO reuse getDefaultNetworks which already filters ids
  Object.keys(config.cityBike.networks).forEach(key => {
    if (citybikeRoutingIsActive(config.cityBike.networks[key])) {
      const network = config.cityBike.networks[key];
      if (isRentingFormFactor(network, formFactor)) {
        mappedNetworks.push({
          networkName: key,
          ...network,
        });
      }
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
 * localstorage (and be sure to only return ones which are defined in current config)
 *
 * @param {*} config The configuration for the software installation
 */
export const getCitybikeNetworks = config => {
  const { allowedVehicleRentalNetworks } = getCustomizedSettings();
  const defaultNetworks = getDefaultNetworks(config);
  if (
    Array.isArray(allowedVehicleRentalNetworks) &&
    !isEmpty(allowedVehicleRentalNetworks)
  ) {
    return allowedVehicleRentalNetworks.filter(networkId =>
      defaultNetworks.includes(networkId),
    );
  }
  return defaultNetworks;
};

/**
 * Assures that config.cityBike.formFactors exists and has a key for every form_factor defined be the networks
 * (either explicitly via form_factors or type, or implicitly by not defining any of these two.)
 */
const initializeFormFactors = config => {
  if (config.cityBike.formFactors == null) {
    // we aim to stay backward compatible, and hence create the cityBike.formFactors config implicitly
    // eslint-disable-next-line no-param-reassign
    config.cityBike.formFactors = {};
  }
  if (!(DEFAULT_FORM_FACTOR in config.cityBike.formFactors)) {
    // eslint-disable-next-line no-param-reassign
    config.cityBike.formFactors[DEFAULT_FORM_FACTOR] = {};
  }
  // iterate through all networks, assure they have form_factors set and formFactors config declares them as well
  const allNetworkIds = getDefaultNetworks(config);
  allNetworkIds.forEach(networkId => {
    const network = config.cityBike.networks[networkId];
    if (!network.form_factors) {
      // initialize form_factors from type or set to default
      network.form_factors = [
        network.type === 'citybike'
          ? 'bicycle'
          : network.type || DEFAULT_FORM_FACTOR,
      ];
    }
    network.form_factors.forEach(formFactor => {
      if (!(formFactor in config.cityBike.formFactors)) {
        // eslint-disable-next-line no-param-reassign
        config.cityBike.formFactors[formFactor] = {};
      }
    });
  });
  // be sure every FormFactor has a set of operators and networkd
  Object.entries(config.cityBike.formFactors).forEach(
    ([, formFactorConfig]) => {
      // eslint-disable-next-line no-param-reassign
      formFactorConfig.operatorIds = new Set();
      // eslint-disable-next-line no-param-reassign
      formFactorConfig.networkIds = new Set();
    },
  );
};

const initializeOperators = config => {
  if (config.cityBike.operators == null) {
    // we aim to stay backward compatible, and hence create the cityBike.formFactors config implicitly
    // eslint-disable-next-line no-param-reassign
    config.cityBike.operators = {};
    // eslint-disable-next-line no-param-reassign
    config.cityBike.operators[DEFAULT_OPERATOR] = {
      operatorId: DEFAULT_OPERATOR,
    };
  }

  Object.entries(config.cityBike.operators).forEach(
    ([operatorId, operator]) => {
      // eslint-disable-next-line no-param-reassign
      operator.operatorId = operatorId;
    },
  );
};
const initializeOperatorAndNetworkdIds = config => {
  const allNetworkIds = getDefaultNetworks(config);
  allNetworkIds.forEach(networkId => {
    const network = config.cityBike.networks[networkId];
    // retrieve it's operator, and add the networks formFactors to the operators formFactors
    // if operator isn't configured, we assign to default operator
    const operator =
      network.operator && network.operator in config.cityBike.operators
        ? network.operator
        : DEFAULT_OPERATOR;
    (network.form_factors || [DEFAULT_FORM_FACTOR]).forEach(formFactor => {
      config.cityBike.formFactors[formFactor].operatorIds.add(operator);
      config.cityBike.formFactors[formFactor].networkIds.add(networkId);
    });
  });

  // sort operators alphabetically (by ID), and place default operator last
  Object.entries(config.cityBike.formFactors).forEach(
    ([, formFactorConfig]) => {
      // eslint-disable-next-line no-param-reassign
      formFactorConfig.operatorIds = Array.from(
        formFactorConfig.operatorIds,
      ).sort();
      const index = formFactorConfig.operatorIds.indexOf(DEFAULT_OPERATOR);
      if (index > -1) {
        formFactorConfig.operatorIds.splice(index, 1);
        formFactorConfig.operatorIds.push(DEFAULT_OPERATOR);
      }
    },
  );
};

const initializeSharingConfig = config => {
  initializeFormFactors(config);
  initializeOperators(config);
  initializeOperatorAndNetworkdIds(config);
};

const assertSharingIsInitialized = config => {
  // TODO move to init
  const formFactors = config.cityBike?.formFactors;
  if (
    formFactors === undefined ||
    Object.keys(formFactors).length === 0 ||
    !Object.values(formFactors)[0].operatorIds
  ) {
    initializeSharingConfig(config);
  }
};

/**
 * Returns IDs of all currently selected sharing operators for the given formFactor.
 * Note: for now, we deduce these implicitly from the enabled network's
 * operator, as we want to stay compatible with current setttings.
 * Downside: we not yet manage the enabled operators per formFactor, so enabling one
 * provider for one formFactor will enable it for the others as well.
 */
export const getCurrentSharingOperators = (config, formFactor) => {
  assertSharingIsInitialized(config);
  const allCurrentNetworks = getCitybikeNetworks(config);

  return allCurrentNetworks
    .filter(networkId =>
      formFactor
        ? config.cityBike.networks[networkId].form_factors.includes(formFactor)
        : true,
    )
    .map(
      networkId =>
        config.cityBike.networks[networkId].operator || DEFAULT_OPERATOR,
    );
};

export const getDefaultFormFactors = config => {
  assertSharingIsInitialized(config);
  return Object.keys(config.cityBike.formFactors);
};

const mapOperators = (operatorIds, config) => {
  return operatorIds
    ? [...operatorIds].map(operatorId => config.cityBike.operators[operatorId])
    : [];
};

export const getSharingOperatorsByFormFactor = (formFactor, config) => {
  assertSharingIsInitialized(config);
  return mapOperators(
    config.cityBike.formFactors[formFactor]?.operatorIds,
    config,
  );
};

const getNetworkIdsByOperatorIds = (operatorIds, config) => {
  return Object.keys(config.cityBike.networks).filter(networkId =>
    operatorIds.includes(
      config.cityBike.networks[networkId].operator || DEFAULT_OPERATOR,
    ),
  );
};

export const toggleSharingOperator = (newValue, config) => {
  const currentOperators = getCurrentSharingOperators(config);

  let chosenOperators;
  // TODO get all networks for operator and en/disable them
  if (currentOperators) {
    chosenOperators = currentOperators.find(o => o === newValue)
      ? without(currentOperators, newValue)
      : currentOperators.concat([newValue]);
  } else {
    chosenOperators = [newValue];
  }

  return getNetworkIdsByOperatorIds(chosenOperators, config);
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
