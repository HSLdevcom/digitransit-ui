import omitBy from 'lodash/omitBy';
import moment from 'moment';
import cookie from 'react-cookie';

import {
  filterModes,
  getDefaultModes,
  getModes,
  modesAsOTPModes,
  getBicycleCompatibleModes,
  isTransportModeAvailable,
} from './modeUtils';
import { otpToLocation, getIntermediatePlaces } from './otpStrings';
import { getDefaultNetworks } from './citybikes';
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
    allowedBikeRentalNetworks: getDefaultNetworks(config),
    useCarParkAvailabilityInformation: null,
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

function getDisableRemainingWeightHeuristic(modes) {
  let disableRemainingWeightHeuristic;
  if (Array.isArray(modes) && modes.includes('BICYCLE_RENT')) {
    disableRemainingWeightHeuristic = true;
  } else {
    disableRemainingWeightHeuristic = false;
  }
  return disableRemainingWeightHeuristic;
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
    useCarParkAvailabilityInformation:
      custSettings.useCarParkAvailabilityInformation,
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

export const preparePlanParams = (config, useDefaultModes) => (
  { from, to },
  {
    location: {
      query: {
        arriveBy,
        intermediatePlaces,
        time,
        locale,
        useCarParkAvailabilityInformation,
      },
    },
  },
) => {
  const settings = getSettings(config);
  const fromLocation = otpToLocation(from);
  const toLocation = otpToLocation(to);
  const intermediatePlaceLocations = getIntermediatePlaces({
    intermediatePlaces,
  });
  const modesOrDefault = useDefaultModes
    ? getDefaultModes(config)
    : filterModes(
        config,
        getModes(config),
        fromLocation,
        toLocation,
        intermediatePlaceLocations,
      );
  const defaultSettings = { ...getDefaultSettings(config) };
  const allowedBikeRentalNetworksMapped =
    settings.allowedBikeRentalNetworks ||
    defaultSettings.allowedBikeRentalNetworks;
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

  return {
    ...defaultSettings,
    ...omitBy(
      {
        fromPlace: from,
        toPlace: to,
        from: fromLocation,
        to: toLocation,
        intermediatePlaces: intermediatePlaceLocations,
        numItineraries: 5,
        date: (time ? moment(time * 1000) : moment()).format('YYYY-MM-DD'),
        time: (time ? moment(time * 1000) : moment()).format('HH:mm:ss'),
        walkReluctance: settings.walkReluctance,
        walkBoardCost: settings.walkBoardCost,
        minTransferTime: config.minTransferTime,
        walkSpeed: settings.walkSpeed,
        arriveBy: arriveBy === 'true',
        maxWalkDistance: config.maxWalkDistance,
        wheelchair,
        transferPenalty: config.transferPenalty,
        bikeSpeed: settings.bikeSpeed,
        optimize: settings.includeBikeSuggestions
          ? config.defaultSettings.optimize
          : config.optimize,
        triangle: {
          safetyFactor: config.defaultSettings.safetyFactor,
          slopeFactor: config.defaultSettings.slopeFactor,
          timeFactor: config.defaultSettings.timeFactor,
        },
        itineraryFiltering: config.itineraryFiltering,
        unpreferred: {
          useUnpreferredRoutesPenalty: config.useUnpreferredRoutesPenalty,
        },
        disableRemainingWeightHeuristic: getDisableRemainingWeightHeuristic(
          modesOrDefault,
        ),
        locale: locale || cookie.load('lang') || 'fi',
        useCarParkAvailabilityInformation,
      },
      nullOrUndefined,
    ),
    modes: formattedModes,
    ticketTypes: getTicketTypes(
      settings.ticketTypes,
      defaultSettings.ticketTypes,
    ),
    allowedBikeRentalNetworks: allowedBikeRentalNetworksMapped,
    shouldMakeWalkQuery:
      !wheelchair && linearDistance < config.suggestWalkMaxDistance,
    shouldMakeBikeQuery:
      !wheelchair &&
      linearDistance < config.suggestBikeMaxDistance &&
      (settings.includeBikeSuggestions
        ? settings.includeBikeSuggestions
        : defaultSettings.includeBikeSuggestions),
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
      includeBikeSuggestions,
    bikeAndPublicMaxWalkDistance: config.suggestBikeMaxDistance,
    bikeandPublicDisableRemainingWeightHeuristic:
      Array.isArray(intermediatePlaceLocations) &&
      intermediatePlaceLocations.length > 0,
    bikeAndPublicModes: [
      { mode: 'BICYCLE' },
      ...modesAsOTPModes(getBicycleCompatibleModes(config, modesOrDefault)),
    ],
    bikeParkModes: [{ mode: 'BICYCLE', qualifier: 'PARK' }, ...formattedModes],
  };
};
