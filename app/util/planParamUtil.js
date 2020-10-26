import omitBy from 'lodash/omitBy';
import moment from 'moment';
import cookie from 'react-cookie';

import { filterModes, getDefaultModes, getModes } from './modeUtils';
import { otpToLocation, getIntermediatePlaces } from './otpStrings';
import { getDefaultNetworks } from './citybikes';
import {
  getCustomizedSettings,
  getRoutingSettings,
} from '../store/localStorage';
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

function getTicketTypes(ticketType, settingsTicketType, defaultTicketType) {
  // separator used to be _, map it to : to keep old URLs compatible
  const remap = str => [`${str}`.replace('_', ':')];
  const isRestriction = type => type !== 'none';

  if (ticketType) {
    return isRestriction(ticketType) ? remap(ticketType) : null;
  }
  if (settingsTicketType) {
    return isRestriction(settingsTicketType) ? remap(settingsTicketType) : null;
  }
  return defaultTicketType && isRestriction(defaultTicketType)
    ? remap(defaultTicketType)
    : null;
}

function getBikeNetworks(allowedBikeRentalNetworks) {
  if (allowedBikeRentalNetworks) {
    if (Array.isArray(allowedBikeRentalNetworks)) {
      return allowedBikeRentalNetworks;
    }
    return allowedBikeRentalNetworks.split(',').map(o => o.toLowerCase());
  }
  return undefined;
}

function nullOrUndefined(val) {
  return val === null || val === undefined;
}

function getMaxWalkDistance(modes, settings, config) {
  let maxWalkDistance;
  if (
    typeof modes === 'undefined' ||
    (typeof modes === 'string' && !modes.split(',').includes('BICYCLE'))
  ) {
    if (!nullOrUndefined(settings.maxWalkDistance)) {
      ({ maxWalkDistance } = settings);
    } else {
      ({ maxWalkDistance } = config);
    }
  } else if (!nullOrUndefined(settings.maxBikingDistance)) {
    maxWalkDistance = settings.maxBikingDistance;
  } else {
    maxWalkDistance = config.maxBikingDistance;
  }
  return maxWalkDistance;
}

function getDisableRemainingWeightHeuristic(
  modes,
  settings,
  intermediatePlaces,
) {
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
  } else if (nullOrUndefined(settings.disableRemainingWeightHeuristic)) {
    disableRemainingWeightHeuristic = false;
  } else {
    ({ disableRemainingWeightHeuristic } = settings);
  }
  return disableRemainingWeightHeuristic;
}

const getNumberValueOrDefault = (value, defaultValue = undefined) =>
  value !== undefined ? Number(value) : defaultValue;
const getBooleanValueOrDefault = (value, defaultValue = undefined) =>
  value !== undefined ? value === 'true' : defaultValue;

export const getSettings = () => {
  const custSettings = getCustomizedSettings();
  const routingSettings = getRoutingSettings();

  return {
    walkSpeed: getNumberValueOrDefault(custSettings.walkSpeed),
    walkReluctance: getNumberValueOrDefault(custSettings.walkReluctance),
    walkBoardCost: getNumberValueOrDefault(custSettings.walkBoardCost),
    modes: undefined,
    minTransferTime: getNumberValueOrDefault(custSettings.minTransferTime),
    usingWheelChair: getNumberValueOrDefault(custSettings.usingWheelChair),
    ticketTypes: custSettings.ticketTypes,
    transferPenalty: getNumberValueOrDefault(custSettings.transferPenalty),
    maxWalkDistance: getNumberValueOrDefault(routingSettings.maxWalkDistance),
    maxBikingDistance: getNumberValueOrDefault(
      routingSettings.maxBikingDistance,
    ),
    bikeSpeed: getNumberValueOrDefault(
      custSettings.bikeSpeed,
      routingSettings.bikeSpeed,
    ),
    optimize: custSettings.optimize || routingSettings.optimize || undefined,
    disableRemainingWeightHeuristic: getBooleanValueOrDefault(
      routingSettings.disableRemainingWeightHeuristic,
    ),
    itineraryFiltering: getNumberValueOrDefault(
      routingSettings.itineraryFiltering,
    ),
    allowedBikeRentalNetworks: custSettings.allowedBikeRentalNetworks,
    includeBikeSuggestions: custSettings.includeBikeSuggestions,
  };
};

export const preparePlanParams = config => (
  { from, to },
  {
    location: {
      query: {
        usingWheelChair,
        arriveBy,
        bikeSpeed,
        intermediatePlaces,
        minTransferTime,
        optimize,
        ticketTypes,
        time,
        transferPenalty,
        walkBoardCost,
        walkReluctance,
        walkSpeed,
        allowedBikeRentalNetworks,
        locale,
      },
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
    (allowedBikeRentalNetworks && getBikeNetworks(allowedBikeRentalNetworks)) ||
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
        numItineraries:
          typeof matchMedia !== 'undefined' &&
          matchMedia('(min-width: 900px)').matches
            ? 5
            : 3,
        date: (time ? moment(time * 1000) : moment()).format('YYYY-MM-DD'),
        time: (time ? moment(time * 1000) : moment()).format('HH:mm:ss'),
        walkReluctance: getNumberValueOrDefault(
          walkReluctance,
          settings.walkReluctance,
        ),
        walkBoardCost: getNumberValueOrDefault(
          walkBoardCost,
          settings.walkBoardCost,
        ),
        minTransferTime: getNumberValueOrDefault(
          minTransferTime,
          settings.minTransferTime,
        ),
        walkSpeed: getNumberValueOrDefault(walkSpeed, settings.walkSpeed),
        arriveBy: arriveBy === 'true',
        maxWalkDistance: getMaxWalkDistance(modesOrDefault, settings, config),
        wheelchair:
          getNumberValueOrDefault(usingWheelChair, settings.usingWheelChair) ===
          1,
        transferPenalty: getNumberValueOrDefault(
          transferPenalty,
          settings.transferPenalty,
        ),
        bikeSpeed: getNumberValueOrDefault(bikeSpeed, settings.bikeSpeed),
        optimize: optimize || settings.optimize,
        itineraryFiltering: getNumberValueOrDefault(
          settings.itineraryFiltering,
          config.itineraryFiltering,
        ),
        unpreferred: {
          useUnpreferredRoutesPenalty: config.useUnpreferredRoutesPenalty,
        },
        disableRemainingWeightHeuristic: getDisableRemainingWeightHeuristic(
          modesOrDefault,
          settings,
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
      ticketTypes,
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
