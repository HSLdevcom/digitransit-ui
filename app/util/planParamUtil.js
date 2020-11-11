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

function getDisableRemainingWeightHeuristic(modes) {
  let disableRemainingWeightHeuristic;
  const modesArray = modes ? modes.split(',') : undefined;
  if (modesArray && modesArray.includes('BICYCLE_RENT')) {
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
    accessibilityOption: getNumberValueOrDefault(
      custSettings.accessibilityOption,
    ),
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
  const formattedModes = modesOrDefault
    .split(',')
    .map(mode => mode.split('_'))
    .map(modeAndQualifier =>
      modeAndQualifier.length > 1
        ? { mode: modeAndQualifier[0], qualifier: modeAndQualifier[1] }
        : { mode: modeAndQualifier[0] },
    );
  const wheelchair =
    getNumberValueOrDefault(settings.accessibilityOption, defaultSettings) ===
    1;
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
        optimize: config.optimize,
        itineraryFiltering: config.itineraryFiltering,
        unpreferred: {
          useUnpreferredRoutesPenalty: config.useUnpreferredRoutesPenalty,
        },
        disableRemainingWeightHeuristic: getDisableRemainingWeightHeuristic(
          modesOrDefault,
        ),
        locale: locale || cookie.load('lang') || 'fi',
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
      !wheelchair &&
      estimateItineraryDistance(
        fromLocation,
        toLocation,
        intermediatePlaceLocations,
      ) < config.suggestWalkMaxDistance,
    shouldMakeBikeQuery:
      !wheelchair &&
      estimateItineraryDistance(
        fromLocation,
        toLocation,
        intermediatePlaceLocations,
      ) < config.suggestBikeMaxDistance &&
      (settings.includeBikeSuggestions !== undefined
        ? settings.includeBikeSuggestions
        : defaultSettings.includeBikeSuggestions),
    showBikeAndPublicItineraries:
      !wheelchair &&
      config.showBikeAndPublicItineraries &&
      (settings.includeBikeSuggestions !== undefined
        ? settings.includeBikeSuggestions
        : defaultSettings.includeBikeSuggestions),
    showBikeAndParkItineraries:
      !wheelchair &&
      config.showBikeAndParkItineraries &&
      (settings.includeBikeSuggestions !== undefined
        ? settings.includeBikeSuggestions
        : defaultSettings.includeBikeSuggestions),
    bikeAndPublicMaxWalkDistance: config.suggestBikeMaxDistance,
    bikeandPublicDisableRemainingWeightHeuristic:
      Array.isArray(intermediatePlaceLocations) &&
      intermediatePlaceLocations.length > 0,
    bikeAndPublicModes: [
      { mode: 'BICYCLE' },
      ...(modesOrDefault.indexOf('SUBWAY') !== -1 ? [{ mode: 'SUBWAY' }] : []),
      ...(modesOrDefault.indexOf('RAIL') !== -1 ? [{ mode: 'RAIL' }] : []),
    ],
    bikeParkModes: [{ mode: 'BICYCLE', qualifier: 'PARK' }, ...formattedModes],
  };
};
