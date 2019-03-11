import omitBy from 'lodash/omitBy';
import moment from 'moment';

import { filterModes, getDefaultModes, getModes } from './modeUtils';
import { otpToLocation } from './otpStrings';
import { getIntermediatePlaces, getQuerySettings } from './queryUtils';
import {
  getCustomizedSettings,
  getRoutingSettings,
} from '../store/localStorage';
import { isEmpty } from 'lodash';

/**
 * Retrieves the default settings from the configuration.
 *
 * @param {*} config the configuration for the software installation
 */
export const getDefaultSettings = config => {
  if (!config) {
    return {};
  }
  return { ...config.defaultSettings, modes: getDefaultModes(config) };
};

/**
 * Retrieves the current (customized) settings that are in use.
 *
 * @param {*} config the configuration for the software installation
 * @param {*} query the query part of the current url
 */
export const getCurrentSettings = (config, query) => ({
  ...getDefaultSettings(config),
  ...getCustomizedSettings(),
  ...getQuerySettings(query),
});

// These values need to be null so if no values for the variables are defined somewhere else,
// these variables will be left out from queries
export const defaultRoutingSettings = {
  ignoreRealtimeUpdates: null,
  maxPreTransitTime: null,
  walkOnStreetReluctance: null,
  waitReluctance: null,
  bikeSpeed: null,
  bikeSwitchTime: null,
  bikeSwitchCost: null,
  bikeBoardCost: null,
  optimize: null,
  triangle: null,
  carParkCarLegWeight: null,
  maxTransfers: null,
  waitAtBeginningFactor: null,
  heuristicStepsPerMainStep: null,
  compactLegsByReversedSearch: null,
  disableRemainingWeightHeuristic: null,
  modeWeight: null,
};

function getTicketTypes(ticketType, settingsTicketType, defaultTicketType) {
  // separator used to be _, map it to : to keep old URLs compatible
  const remap = str => `${str}`.replace('_', ':');
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

function getPreferredorUnpreferredRoutes(queryRoutes, isPreferred, settings, unpreferredPenalty) {
  const preferenceObject = {};
  // queryRoutes is undefined if query params dont contain routes and empty string if user has removed all routes
  if (queryRoutes !== undefined && queryRoutes !== '') {
    // queryRoutes contains routes found in query params
    preferenceObject.routes = queryRoutes;
  } else {
    // default or localstorage routes
    if (isPreferred) {
      preferenceObject.routes = settings.preferredRoutes
    } else {
      preferenceObject.routes = settings.unpreferredRoutes
    }
  }
  if (!isPreferred) {
    // adds penalty weight to unpreferred routes, there might be default unpreferred routes even if user has not defined any
    preferenceObject.useUnpreferredRoutesPenalty = unpreferredPenalty;
  }
  return preferenceObject;
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
    accessibilityOption: getNumberValueOrDefault(
      custSettings.accessibilityOption,
    ),
    ticketTypes: custSettings.ticketTypes,
    transferPenalty: getNumberValueOrDefault(custSettings.transferPenalty),
    maxWalkDistance: getNumberValueOrDefault(routingSettings.maxWalkDistance),
    maxBikingDistance: getNumberValueOrDefault(
      routingSettings.maxBikingDistance,
    ),
    ignoreRealtimeUpdates: getBooleanValueOrDefault(
      routingSettings.ignoreRealtimeUpdates,
    ),
    maxPreTransitTime: getNumberValueOrDefault(
      routingSettings.maxPreTransitTime,
    ),
    walkOnStreetReluctance: getNumberValueOrDefault(
      routingSettings.walkOnStreetReluctance,
    ),
    waitReluctance: getNumberValueOrDefault(routingSettings.waitReluctance),
    bikeSpeed: getNumberValueOrDefault(
      custSettings.bikeSpeed,
      routingSettings.bikeSpeed,
    ),
    bikeSwitchTime: getNumberValueOrDefault(routingSettings.bikeSwitchTime),
    bikeSwitchCost: getNumberValueOrDefault(routingSettings.bikeSwitchCost),
    bikeBoardCost: getNumberValueOrDefault(routingSettings.bikeBoardCost),
    optimize: custSettings.optimize || routingSettings.optimize || undefined,
    safetyFactor: getNumberValueOrDefault(
      custSettings.safetyFactor,
      routingSettings.safetyFactor,
    ),
    slopeFactor: getNumberValueOrDefault(
      custSettings.slopeFactor,
      routingSettings.slopeFactor,
    ),
    timeFactor: getNumberValueOrDefault(
      custSettings.timeFactor,
      routingSettings.timeFactor,
    ),
    carParkCarLegWeight: getNumberValueOrDefault(
      routingSettings.carParkCarLegWeight,
    ),
    maxTransfers: getNumberValueOrDefault(routingSettings.maxTransfers),
    waitAtBeginningFactor: getNumberValueOrDefault(
      routingSettings.waitAtBeginningFactor,
    ),
    heuristicStepsPerMainStep: getNumberValueOrDefault(
      routingSettings.heuristicStepsPerMainStep,
    ),
    compactLegsByReversedSearch: getBooleanValueOrDefault(
      routingSettings.compactLegsByReversedSearch,
    ),
    disableRemainingWeightHeuristic: getBooleanValueOrDefault(
      routingSettings.disableRemainingWeightHeuristic,
    ),
    itineraryFiltering: getNumberValueOrDefault(
      routingSettings.itineraryFiltering,
    ),
    busWeight: getNumberValueOrDefault(routingSettings.busWeight),
    railWeight: getNumberValueOrDefault(routingSettings.railWeight),
    subwayWeight: getNumberValueOrDefault(routingSettings.subwayWeight),
    tramWeight: getNumberValueOrDefault(routingSettings.tramWeight),
    ferryWeight: getNumberValueOrDefault(routingSettings.ferryWeight),
    airplaneWeight: getNumberValueOrDefault(routingSettings.airplaneWeight),
    preferredRoutes: custSettings.preferredRoutes,
    unpreferredRoutes: custSettings.unpreferredRoutes,
  };
};

export const preparePlanParams = config => (
  { from, to },
  {
    location: {
      query: {
        accessibilityOption,
        arriveBy,
        bikeSpeed,
        intermediatePlaces,
        minTransferTime,
        modes,
        numItineraries,
        optimize,
        preferredRoutes,
        safetyFactor,
        slopeFactor,
        timeFactor,
        ticketTypes,
        time,
        transferPenalty,
        unpreferredRoutes,
        walkBoardCost,
        walkReluctance,
        walkSpeed,
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
    getModes({ query: { modes } }, config),
    fromLocation,
    toLocation,
    intermediatePlaceLocations,
  );
  const defaultSettings = { ...getDefaultSettings(config) };

  return {
    ...defaultSettings,
    ...omitBy(
      {
        fromPlace: from,
        toPlace: to,
        from: fromLocation,
        to: toLocation,
        intermediatePlaces: intermediatePlaceLocations,
        numItineraries: getNumberValueOrDefault(numItineraries),
        date: time ? moment(time * 1000).format('YYYY-MM-DD') : undefined,
        time: time ? moment(time * 1000).format('HH:mm:ss') : undefined,
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
        arriveBy: getBooleanValueOrDefault(arriveBy),
        maxWalkDistance: getMaxWalkDistance(modesOrDefault, settings, config),
        wheelchair:
          getNumberValueOrDefault(
            accessibilityOption,
            settings.accessibilityOption,
          ) === 1,
        transferPenalty: getNumberValueOrDefault(
          transferPenalty,
          settings.transferPenalty,
        ),
        ignoreRealtimeUpdates: settings.ignoreRealtimeUpdates,
        maxPreTransitTime: settings.maxPreTransitTime,
        walkOnStreetReluctance: settings.walkOnStreetReluctance,
        waitReluctance: settings.waitReluctance,
        bikeSpeed: getNumberValueOrDefault(bikeSpeed, settings.bikeSpeed),
        bikeSwitchTime: settings.bikeSwitchTime,
        bikeSwitchCost: settings.bikeSwitchCost,
        bikeBoardCost: settings.bikeBoardCost,
        optimize: optimize || settings.optimize,
        triangle:
          (optimize || settings.optimize) === 'TRIANGLE'
            ? {
                safetyFactor: getNumberValueOrDefault(
                  safetyFactor,
                  settings.safetyFactor,
                ),
                slopeFactor: getNumberValueOrDefault(
                  slopeFactor,
                  settings.slopeFactor,
                ),
                timeFactor: getNumberValueOrDefault(
                  timeFactor,
                  settings.timeFactor,
                ),
              }
            : null,
        carParkCarLegWeight: settings.carParkCarLegWeight,
        maxTransfers: settings.maxTransfers,
        waitAtBeginningFactor: settings.waitAtBeginningFactor,
        heuristicStepsPerMainStep: settings.heuristicStepsPerMainStep,
        compactLegsByReversedSearch: settings.compactLegsByReversedSearch,
        itineraryFiltering: getNumberValueOrDefault(
          settings.itineraryFiltering,
          config.itineraryFiltering,
        ),
        modeWeight:
          settings.busWeight !== undefined ||
          settings.railWeight !== undefined ||
          settings.subwayWeight !== undefined ||
          settings.tramWeight !== undefined ||
          settings.ferryWeight !== undefined ||
          settings.airplaneWeight !== undefined
            ? omitBy(
                {
                  BUS: settings.busWeight,
                  RAIL: settings.railWeight,
                  SUBWAY: settings.subwayWeight,
                  TRAM: settings.tramWeight,
                  FERRY: settings.ferryWeight,
                  AIRPLANE: settings.airplaneWeight,
                },
                nullOrUndefined,
              )
            : null,
        preferred: getPreferredorUnpreferredRoutes(
          preferredRoutes,
          true,
          settings,
          config.useUnpreferredRoutesPenalty,
        ),
        unpreferred: getPreferredorUnpreferredRoutes(
          unpreferredRoutes,
          false,
          settings,
          config.useUnpreferredRoutesPenalty,
        ),
        disableRemainingWeightHeuristic: getDisableRemainingWeightHeuristic(
          modesOrDefault,
          settings,
          intermediatePlaceLocations,
        ),
      },
      nullOrUndefined,
    ),
    modes: modesOrDefault,
    ticketTypes: getTicketTypes(
      ticketTypes,
      settings.ticketTypes,
      defaultSettings.ticketTypes,
    ),
  };
};
