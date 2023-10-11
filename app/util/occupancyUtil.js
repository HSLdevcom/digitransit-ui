import moment from 'moment';

export function mapStatus(status) {
  switch (status) {
    case 'EMPTY':
      return 'MANY_SEATS_AVAILABLE';
    case 'NOT_ACCEPTING_PASSENGERS':
      return 'FULL';
    case 'MANY_SEATS_AVAILABLE':
      return 'MANY_SEATS_AVAILABLE';
    case 'FEW_SEATS_AVAILABLE':
      return 'FEW_SEATS_AVAILABLE';
    case 'STANDING_ROOM_ONLY':
      return 'STANDING_ROOM_ONLY';
    case 'CRUSHED_STANDING_ROOM_ONLY':
      return 'CRUSHED_STANDING_ROOM_ONLY';
    case 'FULL':
      return 'FULL';
    default:
      return 'NO_DATA_AVAILABLE';
  }
}

export function isDepartureWithinTenMinutes(departureTime) {
  return (
    moment(departureTime).diff(moment(), 'minutes') <= 10 &&
    moment(departureTime).diff(moment(), 'minutes') > -1
  );
}

export function getCapacity(config, leg) {
  if (
    config.useRealtimeTravellerCapacities &&
    leg.trip?.occupancy?.occupancyStatus !== 'NO_DATA_AVAILABLE' &&
    isDepartureWithinTenMinutes(leg.startTime)
  ) {
    return mapStatus(leg.trip.occupancy.occupancyStatus);
  }
  return undefined;
}
