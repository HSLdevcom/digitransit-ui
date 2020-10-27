import omitBy from 'lodash/omitBy';
import moment from 'moment';
import cookie from 'react-cookie';

import { filterModes, getDefaultModes, getModes } from './modeUtils';
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
    modes: getDefaultModes(config),
    allowedBikeRentalNetworks: getDefaultNetworks(config),
  };
};

/**
 * Retrieves the current (customized) settings that are in use.
 *
 * @param {*} config the configuration for the software installation
 * @param {*} query the query part of the current url
 */
export const getCurrentSettings = config => ({
  ...getDefaultSettings(config),
  ...getCustomizedSettings(),
});

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

function nullOrUndefined(val) {
  return val === null || val === undefined;
}

function getMaxWalkDistance(modes, config) {
  let maxWalkDistance;
  if (
    typeof modes === 'undefined' ||
    (typeof modes === 'string' && !modes.split(',').includes('BICYCLE'))
  ) {
    ({ maxWalkDistance } = config);
  } else {
    maxWalkDistance = config.maxBikingDistance;
  }
  return maxWalkDistance;
}

function getDisableRemainingWeightHeuristic(modes, intermediatePlaces) {
  let disableRemainingWeightHeuristic;
  const modesArray = modes ? modes.split(',') : undefined;
  if (
    modesArray &&
    (modesArray.includes('BICYCLE_RENT') ||
      (modesArray.includes('BICYCLE') &&
        modesArray.length > 1 &&
        intermediatePlaces.length > 0))
  ) {
    disableRemainingWeightHeuristic = true;
  } else {
    disableRemainingWeightHeuristic = false;
  }
  return disableRemainingWeightHeuristic;
}

const getNumberValueOrDefault = (value, defaultValue = undefined) =>
  value !== undefined ? Number(value) : defaultValue;

export const getSettings = () => {
  const custSettings = getCustomizedSettings();

  return {
    walkSpeed: getNumberValueOrDefault(custSettings.walkSpeed),
    walkReluctance: getNumberValueOrDefault(custSettings.walkReluctance),
    walkBoardCost: getNumberValueOrDefault(custSettings.walkBoardCost),
    modes: undefined,
    usingWheelChair: getNumberValueOrDefault(custSettings.usingWheelChair),
    ticketTypes: custSettings.ticketTypes,
    bikeSpeed: getNumberValueOrDefault(custSettings.bikeSpeed),
    allowedBikeRentalNetworks: custSettings.allowedBikeRentalNetworks,
    includeBikeSuggestions: custSettings.includeBikeSuggestions,
  };
};

export const preparePlanParams = config => (
  { from, to },
  {
    location: {
      query: { arriveBy, intermediatePlaces, time, locale },
    },
  },
) => {
  const settings = getSettings();
  const fromLocation = otpToLocation(from);
  const toLocation = otpToLocation(to);
  const intermediatePlaceLocations = getIntermediatePlaces({
    intermediatePlaces,
  });
  const modesOrDefault = filterModes(
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
        minTransferTime: defaultSettings.minTransferTime,
        walkSpeed: settings.walkSpeed,
        arriveBy: arriveBy === 'true',
        maxWalkDistance: getMaxWalkDistance(modesOrDefault, config),
        wheelchair:
          getNumberValueOrDefault(settings.usingWheelChair, defaultSettings) ===
          1,
        transferPenalty: defaultSettings.transferPenalty,
        bikeSpeed: settings.bikeSpeed,
        optimize: defaultSettings.optimize,
        itineraryFiltering: config.itineraryFiltering,
        unpreferred: {
          useUnpreferredRoutesPenalty: config.useUnpreferredRoutesPenalty,
        },
        disableRemainingWeightHeuristic: getDisableRemainingWeightHeuristic(
          modesOrDefault,
          intermediatePlaceLocations,
        ),
        locale: locale || cookie.load('lang') || 'fi',
      },
      nullOrUndefined,
    ),
    modes: modesOrDefault
      .split(',')
      .map(mode => mode.split('_'))
      .map(modeAndQualifier =>
        modeAndQualifier.length > 1
          ? { mode: modeAndQualifier[0], qualifier: modeAndQualifier[1] }
          : { mode: modeAndQualifier[0] },
      ),
    ticketTypes: getTicketTypes(
      settings.ticketTypes,
      defaultSettings.ticketTypes,
    ),
    allowedBikeRentalNetworks: allowedBikeRentalNetworksMapped,
    shouldMakeWalkQuery:
      estimateItineraryDistance(
        fromLocation,
        toLocation,
        intermediatePlaceLocations,
      ) < config.suggestWalkMaxDistance,
    shouldMakeBikeQuery:
      estimateItineraryDistance(
        fromLocation,
        toLocation,
        intermediatePlaceLocations,
      ) < config.suggestBikeMaxDistance &&
      (settings.includeBikeSuggestions
        ? settings.includeBikeSuggestions
        : defaultSettings.includeBikeSuggestions),
    showBikeAndPublicItineraries:
      config.showBikeAndPublicItineraries &&
      (settings.includeBikeSuggestions
        ? settings.includeBikeSuggestions
        : defaultSettings.includeBikeSuggestions),
    showBikeAndParkItineraries:
      config.showBikeAndParkItineraries &&
      (settings.includeBikeSuggestions
        ? settings.includeBikeSuggestions
        : defaultSettings.includeBikeSuggestions),
  };
};
