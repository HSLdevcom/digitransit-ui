import { legTime } from './legUtils';

/**
 * Maps status to corresponding string.
 *
 * @param {*} status status from OTP.
 */
export function mapStatus(status) {
  switch (status) {
    case 'EMPTY':
    case 'MANY_SEATS_AVAILABLE':
      return 'MANY_SEATS_AVAILABLE';
    case 'FEW_SEATS_AVAILABLE':
      return 'FEW_SEATS_AVAILABLE';
    case 'STANDING_ROOM_ONLY':
      return 'STANDING_ROOM_ONLY';
    case 'CRUSHED_STANDING_ROOM_ONLY':
    case 'NOT_ACCEPTING_PASSENGERS':
    case 'FULL':
      return 'CRUSHED_STANDING_ROOM_ONLY';
    default:
      return 'NO_DATA_AVAILABLE';
  }
}

/**
 * Maps status to translation id
 *
 * @param {*} status status from OTP.
 */
export function capacityToTranslationId(status) {
  switch (status) {
    case 'EMPTY':
    case 'MANY_SEATS_AVAILABLE':
      return 'capacity-modal.many-seats-available';
    case 'STANDING_ROOM_ONLY':
      return 'capacity-modal.standing-room-only';
    case 'CRUSHED_STANDING_ROOM_ONLY':
    case 'NOT_ACCEPTING_PASSENGERS':
    case 'FULL':
      return 'capacity-modal.crushed-standing-room-only';
    case 'FEW_SEATS_AVAILABLE':
    default:
      return 'capacity-modal.few-seats-available';
  }
}

/**
 * Checks that departure is within the configured time window from now.
 *
 * @param {*} departureTime departure time in Unix.
 * @param {number} windowMinutes size of the visibility window in minutes.
 */
export function isDepartureWithinWindow(departureTime, windowMinutes) {
  const now = Date.now();
  const diff = (departureTime - now) / (60 * 1000); // to minutes
  return diff > 0 && diff < windowMinutes;
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
    isDepartureWithinWindow(
      departureTime,
      config.realtimeTravellerCapacityWindowMinutes,
    )
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
    legTime(leg.start),
  );
}
