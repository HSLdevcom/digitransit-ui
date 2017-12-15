import omitBy from 'lodash/omitBy';
import isNil from 'lodash/isNil';

import moment from 'moment';
// Localstorage data
import { getCustomizedSettings } from '../store/localStorage';
import { otpToLocation } from './otpStrings';

function getIntermediatePlaces(intermediatePlaces) {
  if (!intermediatePlaces) {
    return [];
  } else if (Array.isArray(intermediatePlaces)) {
    return intermediatePlaces.map(otpToLocation);
  } else if (typeof intermediatePlaces === 'string') {
    return [otpToLocation(intermediatePlaces)];
  }
  return [];
}

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

export const getSettings = () => {
  const custSettings = getCustomizedSettings();

  return {
    walkSpeed: custSettings.walkSpeed
      ? Number(custSettings.walkSpeed)
      : undefined,
    walkReluctance: custSettings.walkReluctance
      ? Number(custSettings.walkReluctance)
      : undefined,
    walkBoardCost: custSettings.walkBoardCost
      ? Number(custSettings.walkBoardCost)
      : undefined,
    modes: custSettings.modes
      ? custSettings.modes
          .toString()
          .split(',')
          .map(mode => (mode === 'CITYBIKE' ? 'BICYCLE_RENT' : mode))
          .sort()
          .join(',')
      : undefined,
    minTransferTime: custSettings.minTransferTime
      ? Number(custSettings.minTransferTime)
      : undefined,
    accessibilityOption: custSettings.accessibilityOption
      ? custSettings.accessibilityOption
      : undefined,
    ticketTypes: custSettings.ticketTypes
      ? custSettings.ticketTypes
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
      },
    },
  },
) => {
  const settings = getSettings();
  return {
    ...omitBy(
      {
        fromPlace: from,
        toPlace: to,
        from: otpToLocation(from),
        to: otpToLocation(to),
        intermediatePlaces: getIntermediatePlaces(intermediatePlaces),
        numItineraries: numItineraries ? Number(numItineraries) : undefined,
        modes: modes
          ? modes
              .split(',')
              .map(mode => (mode === 'CITYBIKE' ? 'BICYCLE_RENT' : mode))
              .sort()
              .join(',')
          : settings.modes,
        date: time ? moment(time * 1000).format('YYYY-MM-DD') : undefined,
        time: time ? moment(time * 1000).format('HH:mm:ss') : undefined,
        walkReluctance: walkReluctance
          ? Number(walkReluctance)
          : settings.walkReluctance,
        walkBoardCost: walkBoardCost
          ? Number(walkBoardCost)
          : settings.walkBoardCost,
        minTransferTime: minTransferTime
          ? Number(minTransferTime)
          : settings.minTransferTime,
        walkSpeed: walkSpeed ? Number(walkSpeed) : settings.walkSpeed,
        arriveBy: arriveBy ? arriveBy === 'true' : undefined,
        maxWalkDistance:
          typeof modes === 'undefined' ||
          (typeof modes === 'string' && !modes.split(',').includes('BICYCLE'))
            ? config.maxWalkDistance
            : config.maxBikingDistance,
        wheelchair:
          accessibilityOption === '1'
            ? true
            : settings.accessibilityOption === '1',
        preferred: { agencies: config.preferredAgency || '' },
        disableRemainingWeightHeuristic:
          modes && modes.split(',').includes('CITYBIKE'),
      },
      isNil,
    ),
    ticketTypes: setTicketTypes(ticketTypes, settings.ticketTypes),
  };
};
