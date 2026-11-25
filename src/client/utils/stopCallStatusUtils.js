import { STOP_STATUS_BADGE_IMGS } from './stopStatusUtils';

// Trip-scoped statuses: how a single trip treats a stop, as opposed to the stop-scoped
// STOP_STATUS values that apply to the stop regardless of the trip.
export const STOP_CALL_STATUS = { CANCELED: 'canceled' };

export const STOP_CALL_STATUS_BADGE_IMGS = { [STOP_CALL_STATUS.CANCELED]: 'icon_canceled-stop' };

/**
 * Resolves the status a route line stop marker displays. The trip-scoped call status
 * takes precedence over the stop-scoped status.
 *
 * @param {string} [stopCallStatus] a STOP_CALL_STATUS value
 * @param {string} [stopStatus] a STOP_STATUS value
 * @returns {{ status: string, badgeImg: string }|null} displayed status and its badge image
 */
export function resolveMarkerBadge(stopCallStatus, stopStatus) {
  const status = stopCallStatus || stopStatus;
  const badgeImg = STOP_CALL_STATUS_BADGE_IMGS[status] || STOP_STATUS_BADGE_IMGS[status];
  return badgeImg ? { status, badgeImg } : null;
}
