import omitBy from 'lodash/omitBy';
import moment from 'moment';

import {
  filterModes,
  getDefaultModes,
  getModes,
  modesAsOTPModes,
  getBicycleCompatibleModes,
  isTransportModeAvailable,
} from './modeUtils';
import { otpToLocation, getIntermediatePlaces } from './otpStrings';
import { getCitybikeNetworks, getDefaultNetworks } from './citybikes';
import { getCustomizedSettings } from '../store/localStorage';
import { estimateItineraryDistance } from './geo-utils';

/**
 * Retrieves the default settings from the configuration.
 *
 * @param {*} config the configuration for the software installation
 */
export const getDefaultSettings = config => {
  if (!config) {
    return {};
  }
  return {
    ...config.defaultSettings,
    modes: getDefaultModes(config).sort(),
    allowedBikeRentalNetworks: config.transportModes.citybike.defaultValue
      ? getDefaultNetworks(config)
      : [],
  };
};

/**
 * Retrieves the current (customized) settings that are in use.
 *
 * @param {*} config the configuration for the software installation
 * @param {*} query the query part of the current url
 */
export const getCurrentSettings = config => {
  const defaultSettings = getDefaultSettings(config);
  const customizedSettings = getCustomizedSettings();
  return {
    ...defaultSettings,
    ...customizedSettings,
    modes: customizedSettings?.modes
      ? [
          ...customizedSettings?.modes.filter(mode =>
            isTransportModeAvailable(config, mode),
          ),
          'WALK',
        ].sort()
      : defaultSettings.modes,
    allowedBikeRentalNetworks: getCitybikeNetworks(),
  };
};

function getTicketTypes(settingsTicketType, defaultTicketType) {
  // separator used to be _, map it to : to keep old URLs compatible
  const remap = str => [`${str}`.replace('_', ':')];
  const isRestriction = type => type !== 'none';

  if (settingsTicketType) {
    return isRestriction(settingsTicketType) ? remap(settingsTicketType) : null;
  }
  return defaultTicketType && isRestriction(defaultTicketType)
    ? remap(defaultTicketType)
    : null;
}
/**
 * Find an option nearest to the value
 *
 * @param value a number
 * @param options array of numbers
 * @returns on option from options that is closest to the provided value
 */
export const findNearestOption = (value, options) => {
  let currNearest = options[0];
  let diff = Math.abs(value - currNearest);
  for (let i = 0; i < options.length; i++) {
    const newdiff = Math.abs(value - options[i]);
    if (newdiff < diff) {
      diff = newdiff;
      currNearest = options[i];
    }
  }
  return currNearest;
};

function nullOrUndefined(val) {
  return val === null || val === undefined;
}

const getNumberValueOrDefault = (value, defaultValue = undefined) =>
  value !== undefined ? Number(value) : defaultValue;

export const getSettings = config => {
  const custSettings = getCustomizedSettings();

  return {
    walkSpeed:
      config.defaultOptions.walkSpeed.find(
        option =>
          option ===
          getNumberValueOrDefault(
            custSettings.walkSpeed,
            config.defaultSettings.walkSpeed,
          ),
      ) ||
      config.defaultOptions.walkSpeed.find(
        option =>
          option ===
          findNearestOption(
            getNumberValueOrDefault(
              custSettings.walkSpeed,
              config.defaultSettings.walkSpeed,
            ),
            config.defaultOptions.walkSpeed,
          ),
      ),
    walkReluctance: getNumberValueOrDefault(custSettings.walkReluctance),
    walkBoardCost: getNumberValueOrDefault(custSettings.walkBoardCost),
    modes: undefined,
    accessibilityOption: getNumberValueOrDefault(
      custSettings.accessibilityOption,
    ),
    ticketTypes: custSettings.ticketTypes,
    bikeSpeed:
      config.defaultOptions.bikeSpeed.find(
        option =>
          option ===
          getNumberValueOrDefault(
            custSettings.bikeSpeed,
            config.defaultSettings.bikeSpeed,
          ),
      ) ||
      config.defaultOptions.bikeSpeed.find(
        option =>
          option ===
          findNearestOption(
            getNumberValueOrDefault(
              custSettings.bikeSpeed,
              config.defaultSettings.bikeSpeed,
            ),
            config.defaultOptions.bikeSpeed,
          ),
      ),
    allowedBikeRentalNetworks: custSettings.allowedBikeRentalNetworks,
    includeBikeSuggestions: custSettings.includeBikeSuggestions,
    includeCarSuggestions: custSettings.includeCarSuggestions,
    includeParkAndRideSuggestions: custSettings.includeParkAndRideSuggestions,
    showBikeAndParkItineraries: custSettings.showBikeAndParkItineraries,
  };
};

const getShouldMakeParkRideQuery = (
  linearDistance,
  config,
  settings,
  defaultSettings,
) => {
  return (
    linearDistance > config.suggestCarMinDistance &&
    (settings.includeParkAndRideSuggestions
      ? settings.includeParkAndRideSuggestions
      : defaultSettings.includeParkAndRideSuggestions)
  );
};

const getShouldMakeCarQuery = (
  linearDistance,
  config,
  settings,
  defaultSettings,
) => {
  return (
    linearDistance > config.suggestCarMinDistance &&
    (settings.includeCarSuggestions
      ? settings.includeCarSuggestions
      : defaultSettings.includeCarSuggestions)
  );
};

export const hasStartAndDestination = ({ from, to }) =>
  from && to && from !== '-' && to !== '-';

export const preparePlanParams = (config, useDefaultModes) => (
  { from, to },
  {
    location: {
      query: { arriveBy, intermediatePlaces, time },
    },
  },
) => {
  const settings = getSettings(config);
  const fromLocation = otpToLocation(from);
  const toLocation = otpToLocation(to);
  const intermediatePlaceLocations = getIntermediatePlaces({
    intermediatePlaces,
  });
  let modesOrDefault = useDefaultModes
    ? getDefaultModes(config)
    : filterModes(
        config,
        getModes(config),
        fromLocation,
        toLocation,
        intermediatePlaceLocations,
      );
  const defaultSettings = { ...getDefaultSettings(config) };
  const allowedCitybikeNetworks = getDefaultNetworks(config);
  // legacy settings used to set network name in uppercase in localstorage
  const allowedBikeRentalNetworksMapped =
    Array.isArray(settings.allowedBikeRentalNetworks) &&
    settings.allowedBikeRentalNetworks.length > 0
      ? settings.allowedBikeRentalNetworks
          .filter(
            network =>
              allowedCitybikeNetworks.includes(network) ||
              allowedCitybikeNetworks.includes(network.toLowerCase()),
          )
          .map(network =>
            allowedCitybikeNetworks.includes(network.toLowerCase())
              ? network.toLowerCase()
              : network,
          )
      : defaultSettings.allowedBikeRentalNetworks;
  if (
    !allowedBikeRentalNetworksMapped ||
    !allowedBikeRentalNetworksMapped.length
  ) {
    // do not ask citybike routes if no networks are allowed
    modesOrDefault = modesOrDefault.filter(mode => mode !== 'BICYCLE_RENT');
  }
  const formattedModes = modesAsOTPModes(modesOrDefault);
  const wheelchair =
    getNumberValueOrDefault(settings.accessibilityOption, defaultSettings) ===
    1;
  const includeBikeSuggestions =
    settings.includeBikeSuggestions !== undefined
      ? settings.includeBikeSuggestions
      : defaultSettings.includeBikeSuggestions;
  const linearDistance = estimateItineraryDistance(
    fromLocation,
    toLocation,
    intermediatePlaceLocations,
  );

  // Use defaults or user given settings
  const ticketTypes = useDefaultModes
    ? null
    : getTicketTypes(settings.ticketTypes, defaultSettings.ticketTypes);
  const walkReluctance = useDefaultModes
    ? defaultSettings.walkReluctance
    : settings.walkReluctance;
  const walkBoardCost = useDefaultModes
    ? defaultSettings.walkBoardCost
    : settings.walkBoardCost;

  return {
    ...defaultSettings,
    ...omitBy(
      {
        fromPlace: from,
        toPlace: to,
        from: fromLocation,
        to: toLocation,
        numItineraries: 5,
        date: (time ? moment(time * 1000) : moment()).format('YYYY-MM-DD'),
        time: (time ? moment(time * 1000) : moment()).format('HH:mm:ss'),
        walkReluctance,
        walkBoardCost,
        minTransferTime: config.minTransferTime,
        walkSpeed: settings.walkSpeed,
        arriveBy: arriveBy === 'true',
        wheelchair,
        transferPenalty: config.transferPenalty,
        bikeSpeed: settings.bikeSpeed,
        optimize: config.optimize,
      },
      nullOrUndefined,
    ),
    modes: formattedModes,
    ticketTypes,
    modeWeight: config.customWeights,
    allowedBikeRentalNetworks: allowedBikeRentalNetworksMapped,
    shouldMakeWalkQuery:
      !wheelchair && linearDistance < config.suggestWalkMaxDistance,
    shouldMakeBikeQuery:
      !wheelchair &&
      linearDistance < config.suggestBikeMaxDistance &&
      includeBikeSuggestions,
    shouldMakeCarQuery: getShouldMakeCarQuery(
      linearDistance,
      config,
      settings,
      defaultSettings,
    ),
    shouldMakeParkRideQuery: getShouldMakeParkRideQuery(
      linearDistance,
      config,
      settings,
      defaultSettings,
    ),
    showBikeAndPublicItineraries:
      !wheelchair &&
      config.showBikeAndPublicItineraries &&
      modesOrDefault.length > 1 &&
      includeBikeSuggestions,
    showBikeAndParkItineraries:
      !wheelchair &&
      config.showBikeAndParkItineraries &&
      modesOrDefault.length > 1 &&
      !config.includePublicWithBikePlan
        ? settings.showBikeAndParkItineraries ||
          defaultSettings.showBikeAndParkItineraries
        : includeBikeSuggestions,
    bikeAndPublicModes: [
      { mode: 'BICYCLE' },
      ...modesAsOTPModes(getBicycleCompatibleModes(config, modesOrDefault)),
    ],
    bikeParkModes: [
      { mode: 'BICYCLE', qualifier: 'PARK' },
      ...formattedModes,
    ].filter(mode => mode.qualifier !== 'RENT'), // BICYCLE_RENT can't be used together with BICYCLE_PARK
  };
};
