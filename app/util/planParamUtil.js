import omitBy from 'lodash/omitBy';
import moment from 'moment';

import { filterModes, getDefaultModes, getModes } from './modeUtils';
import { otpToLocation } from './otpStrings';
import { getIntermediatePlaces } from './queryUtils';
import {
  getCustomizedSettings,
  getRoutingSettings,
} from '../store/localStorage';

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

function setTicketTypes(ticketType, settingsTicketType) {
  if (ticketType !== undefined && ticketType !== 'none') {
    return ticketType;
  } else if (
    settingsTicketType !== undefined &&
    settingsTicketType !== 'none' &&
    ticketType !== 'none'
  ) {
    return settingsTicketType;
  }
  return null;
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

function getDisableRemainingWeightHeuristic(modes, settings) {
  let disableRemainingWeightHeuristic;
  if (modes && modes.split(',').includes('CITYBIKE')) {
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
    bikeSpeed: getNumberValueOrDefault(routingSettings.bikeSpeed),
    bikeSwitchTime: getNumberValueOrDefault(routingSettings.bikeSwitchTime),
    bikeSwitchCost: getNumberValueOrDefault(routingSettings.bikeSwitchCost),
    bikeBoardCost: getNumberValueOrDefault(routingSettings.bikeBoardCost),
    optimize:
      routingSettings.optimize !== undefined
        ? routingSettings.optimize
        : undefined,
    safetyFactor: getNumberValueOrDefault(routingSettings.safetyFactor),
    slopeFactor: getNumberValueOrDefault(routingSettings.slopeFactor),
    timeFactor: getNumberValueOrDefault(routingSettings.timeFactor),
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
    preferred:
      custSettings.preferred !== undefined ? custSettings.preferred : undefined,
    unpreferred:
      custSettings.unpreferred !== undefined
        ? custSettings.unpreferred
        : undefined,
  };
};

export const preparePlanParams = config => (
  { from, to },
  {
    location: {
      query: {
        intermediatePlaces,
        numItineraries,
        time,
        arriveBy,
        walkReluctance,
        walkSpeed,
        walkBoardCost,
        minTransferTime,
        modes,
        accessibilityOption,
        ticketTypes,
        transferPenalty,
        preferred,
        unpreferred,
      },
    },
  },
) => {
  const settings = getSettings();
  const modesOrDefault = filterModes(
    config,
    getModes({ query: { modes } }, config),
  );

  return {
    ...getDefaultSettings(config),
    ...omitBy(
      {
        fromPlace: from,
        toPlace: to,
        from: otpToLocation(from),
        to: otpToLocation(to),
        intermediatePlaces: getIntermediatePlaces({ intermediatePlaces }),
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
        bikeSpeed: settings.bikeSpeed,
        bikeSwitchTime: settings.bikeSwitchTime,
        bikeSwitchCost: settings.bikeSwitchCost,
        bikeBoardCost: settings.bikeBoardCost,
        optimize: settings.optimize,
        triangle:
          settings.optimize === 'TRIANGLE'
            ? {
                safetyFactor: settings.safetyFactor,
                slopeFactor: settings.slopeFactor,
                timeFactor: settings.timeFactor,
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
        preferred: {
          routes: preferred || settings.preferred,
        },
        unpreferred: {
          routes: unpreferred || settings.unpreferred,
        },
        disableRemainingWeightHeuristic: getDisableRemainingWeightHeuristic(
          modesOrDefault,
          settings,
        ),
      },
      nullOrUndefined,
    ),
    modes: modesOrDefault,
    ticketTypes: setTicketTypes(ticketTypes, settings.ticketTypes),
  };
};
