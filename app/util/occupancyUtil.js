import moment from 'moment';

/**
 * Maps status to corresponding string.
 *
 * @param {*} status status from OTP.
 */
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

/**
 * Checks that departure is within 10 minutes from now.
 *
 * @param {*} departureTime departure time in Unix.
 */
export function isDepartureWithinTenMinutes(departureTime) {
  return (
    moment(departureTime).diff(moment(), 'minutes') <= 10 &&
    moment(departureTime).diff(moment(), 'minutes') > -1
  );
}

/**
 * Returns mapped capacity string.
 *
 * @param {*} occupancyStatus status from OTP.
 */
export function getCapacity(occupancyStatus) {
  return mapStatus(occupancyStatus);
}

/**
 * Returns capacity string for leg.
 *
 * @param {*} config configuration object.
 * @param {*} leg leg object.
 */
export function getCapacityForLeg(config, leg) {
  if (
    config.useRealtimeTravellerCapacities &&
    leg.trip?.occupancy?.occupancyStatus !== 'NO_DATA_AVAILABLE' &&
    isDepartureWithinTenMinutes(leg.startTime)
  ) {
    return getCapacity(leg.trip.occupancy.occupancyStatus);
  }
  return undefined;
}
