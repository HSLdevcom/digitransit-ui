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
      return 'CRUSHED_STANDING_ROOM_ONLY';
    case 'MANY_SEATS_AVAILABLE':
      return 'MANY_SEATS_AVAILABLE';
    case 'FEW_SEATS_AVAILABLE':
      return 'FEW_SEATS_AVAILABLE';
    case 'STANDING_ROOM_ONLY':
      return 'STANDING_ROOM_ONLY';
    case 'CRUSHED_STANDING_ROOM_ONLY':
      return 'CRUSHED_STANDING_ROOM_ONLY';
    case 'FULL':
      return 'CRUSHED_STANDING_ROOM_ONLY';
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
 * @param {*} config configuration object.
 * @param {*} occupancyStatus status from OTP.
 * @param {*} departureTime departure time in Unix.
 */
export function getCapacity(config, occupancyStatus, departureTime) {
  if (
    config.useRealtimeTravellerCapacities &&
    occupancyStatus &&
    occupancyStatus !== 'NO_DATA_AVAILABLE' &&
    isDepartureWithinTenMinutes(departureTime)
  ) {
    return mapStatus(occupancyStatus);
  }
  return null;
}

/**
 * Returns capacity string for leg.
 *
 * @param {*} config configuration object.
 * @param {*} leg leg object.
 */
export function getCapacityForLeg(config, leg) {
  return getCapacity(
    config,
    leg.trip?.occupancy?.occupancyStatus,
    leg.startTime,
  );
}
