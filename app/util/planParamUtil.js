import omitBy from 'lodash/omitBy';
import moment from 'moment';

import { filterModes, getModes } from './modeUtils';
import { otpToLocation } from './otpStrings';
import { getIntermediatePlaces } from './queryUtils';
import {
  getCustomizedSettings,
  getRoutingSettings,
} from '../store/localStorage';

export const WALKBOARDCOST_DEFAULT = 600;

export const defaultSettings = {
  accessibilityOption: 0,
  minTransferTime: 120,
  walkBoardCost: WALKBOARDCOST_DEFAULT,
  transferPenalty: 0,
  walkReluctance: 2,
  walkSpeed: 1.2,
  ticketTypes: 'none',
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

function isTrue(val) {
  return val === 'true';
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

export const getSettings = () => {
  const custSettings = getCustomizedSettings();
  const routingSettings = getRoutingSettings();

  return {
    walkSpeed:
      custSettings.walkSpeed !== undefined
        ? Number(custSettings.walkSpeed)
        : undefined,
    walkReluctance:
      custSettings.walkReluctance !== undefined
        ? Number(custSettings.walkReluctance)
        : undefined,
    walkBoardCost:
      custSettings.walkBoardCost !== undefined
        ? Number(custSettings.walkBoardCost)
        : undefined,
    modes: undefined,
    minTransferTime:
      custSettings.minTransferTime !== undefined
        ? Number(custSettings.minTransferTime)
        : undefined,
    accessibilityOption:
      custSettings.accessibilityOption !== undefined
        ? Number(custSettings.accessibilityOption) === 1
        : undefined,
    ticketTypes: custSettings.ticketTypes,
    transferPenalty:
      custSettings.transferPenalty !== undefined
        ? Number(custSettings.transferPenalty)
        : undefined,
    maxWalkDistance:
      routingSettings.maxWalkDistance !== undefined
        ? Number(routingSettings.maxWalkDistance)
        : undefined,
    maxBikingDistance:
      routingSettings.maxBikingDistance !== undefined
        ? Number(routingSettings.maxBikingDistance)
        : undefined,
    ignoreRealtimeUpdates:
      routingSettings.ignoreRealtimeUpdates !== undefined
        ? isTrue(routingSettings.ignoreRealtimeUpdates)
        : undefined,
    maxPreTransitTime:
      routingSettings.maxPreTransitTime !== undefined
        ? Number(routingSettings.maxPreTransitTime)
        : undefined,
    walkOnStreetReluctance:
      routingSettings.walkOnStreetReluctance !== undefined
        ? Number(routingSettings.walkOnStreetReluctance)
        : undefined,
    waitReluctance:
      routingSettings.waitReluctance !== undefined
        ? Number(routingSettings.waitReluctance)
        : undefined,
    bikeSpeed:
      routingSettings.bikeSpeed !== undefined
        ? Number(routingSettings.bikeSpeed)
        : undefined,
    bikeSwitchTime:
      routingSettings.bikeSwitchTime !== undefined
        ? Number(routingSettings.bikeSwitchTime)
        : undefined,
    bikeSwitchCost:
      routingSettings.bikeSwitchCost !== undefined
        ? Number(routingSettings.bikeSwitchCost)
        : undefined,
    bikeBoardCost:
      routingSettings.bikeBoardCost !== undefined
        ? Number(routingSettings.bikeBoardCost)
        : undefined,
    optimize:
      routingSettings.optimize !== undefined
        ? routingSettings.optimize
        : undefined,
    safetyFactor:
      routingSettings.safetyFactor !== undefined
        ? Number(routingSettings.safetyFactor)
        : undefined,
    slopeFactor:
      routingSettings.slopeFactor !== undefined
        ? Number(routingSettings.slopeFactor)
        : undefined,
    timeFactor:
      routingSettings.timeFactor !== undefined
        ? Number(routingSettings.timeFactor)
        : undefined,
    carParkCarLegWeight:
      routingSettings.carParkCarLegWeight !== undefined
        ? Number(routingSettings.carParkCarLegWeight)
        : undefined,
    maxTransfers:
      routingSettings.maxTransfers !== undefined
        ? Number(routingSettings.maxTransfers)
        : undefined,
    waitAtBeginningFactor:
      routingSettings.waitAtBeginningFactor !== undefined
        ? Number(routingSettings.waitAtBeginningFactor)
        : undefined,
    heuristicStepsPerMainStep:
      routingSettings.heuristicStepsPerMainStep !== undefined
        ? Number(routingSettings.heuristicStepsPerMainStep)
        : undefined,
    compactLegsByReversedSearch:
      routingSettings.compactLegsByReversedSearch !== undefined
        ? isTrue(routingSettings.compactLegsByReversedSearch)
        : undefined,
    disableRemainingWeightHeuristic:
      routingSettings.disableRemainingWeightHeuristic !== undefined
        ? isTrue(routingSettings.disableRemainingWeightHeuristic)
        : undefined,
    itineraryFiltering:
      routingSettings.itineraryFiltering !== undefined
        ? Number(routingSettings.itineraryFiltering)
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
    ...defaultSettings,
    ...omitBy(
      {
        fromPlace: from,
        toPlace: to,
        from: otpToLocation(from),
        to: otpToLocation(to),
        intermediatePlaces: getIntermediatePlaces({ intermediatePlaces }),
        numItineraries: numItineraries ? Number(numItineraries) : undefined,
        date: time ? moment(time * 1000).format('YYYY-MM-DD') : undefined,
        time: time ? moment(time * 1000).format('HH:mm:ss') : undefined,
        walkReluctance:
          walkReluctance !== undefined
            ? Number(walkReluctance)
            : settings.walkReluctance,
        walkBoardCost:
          walkBoardCost !== undefined
            ? Number(walkBoardCost)
            : settings.walkBoardCost,
        minTransferTime:
          minTransferTime !== undefined
            ? Number(minTransferTime)
            : settings.minTransferTime,
        walkSpeed:
          walkSpeed !== undefined ? Number(walkSpeed) : settings.walkSpeed,
        arriveBy: arriveBy ? arriveBy === 'true' : undefined,
        maxWalkDistance: getMaxWalkDistance(modesOrDefault, settings, config),
        wheelchair:
          accessibilityOption !== undefined
            ? Number(accessibilityOption) === 1
            : settings.accessibilityOption,
        transferPenalty:
          transferPenalty !== undefined
            ? Number(transferPenalty)
            : settings.transferPenalty,
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
        itineraryFiltering:
          settings.itineraryFiltering !== undefined
            ? settings.itineraryFiltering
            : config.itineraryFiltering,
        preferred: { agencies: config.preferredAgency || '' },
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
