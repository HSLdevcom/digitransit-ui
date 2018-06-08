import omitBy from 'lodash/omitBy';
import moment from 'moment';

// Localstorage data
import { getCustomizedSettings } from '../store/localStorage';
import { filterModes } from './modeUtils';
import { otpToLocation } from './otpStrings';
import { getIntermediatePlaces } from './queryUtils';

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

export const getSettings = config => {
  const custSettings = getCustomizedSettings();

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
    modes: custSettings.modes
      ? filterModes(config, custSettings.modes)
      : undefined,
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
  const settings = getSettings(config);

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
        modes: modes ? filterModes(config, modes) : settings.modes,
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
        maxWalkDistance:
          typeof modes === 'undefined' ||
          (typeof modes === 'string' && !modes.split(',').includes('BICYCLE'))
            ? config.maxWalkDistance
            : config.maxBikingDistance,
        wheelchair:
          accessibilityOption !== undefined
            ? Number(accessibilityOption) === 1
            : settings.accessibilityOption,
        transferPenalty:
          transferPenalty !== undefined
            ? Number(transferPenalty)
            : settings.transferPenalty,
        preferred: { agencies: config.preferredAgency || '' },
        disableRemainingWeightHeuristic:
          modes && modes.split(',').includes('CITYBIKE'),
        itineraryFiltering: config.itineraryFiltering,
      },
      nullOrUndefined,
    ),
    ticketTypes: setTicketTypes(ticketTypes, settings.ticketTypes),
  };
};
