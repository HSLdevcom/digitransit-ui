import { isAlertValid, getMaximumAlertSeverityLevel } from './alertUtils';
import { AlertSeverityLevelType } from '../constants';

export const STOP_STATUS = {
  OUT_OF_SERVICE: 'out-of-service',
  NO_SERVICE_TODAY: 'no-service-today',
  ALERT: 'alert',
  INFO: 'info',
};

/**
 * Maps an alert severity level to the matching stop status. Info-level alerts
 * map to the INFO status (gray info icon); warning, severe and unknown levels
 * map to the ALERT status (red triangle).
 *
 * @param {string} alertSeverityLevel an AlertSeverityLevelType value
 * @returns {string|null} STOP_STATUS.ALERT, STOP_STATUS.INFO or null
 */
export function severityToStatus(alertSeverityLevel) {
  if (!alertSeverityLevel) {
    return null;
  }
  return alertSeverityLevel === AlertSeverityLevelType.Info
    ? STOP_STATUS.INFO
    : STOP_STATUS.ALERT;
}

/**
 * Whether a stop should be treated as fully out of service: either it is closed
 * by a service alert, or it has no services running today nor in the future.
 * Note: if services are added for the current day via realtime,
 * `servicesRunningOnServiceDate` will be true.
 *
 * @param {object} params
 * @param {boolean} params.closedByServiceAlert stop is closed by a service alert
 * @param {boolean} params.servicesRunningOnServiceDate services run on the current service date
 * @param {boolean} params.servicesRunningInFuture services run on a future service date
 * @returns {boolean} true when the stop is out of service
 */
export function isStopOutOfService({
  closedByServiceAlert,
  servicesRunningOnServiceDate,
  servicesRunningInFuture,
}) {
  return (
    !!closedByServiceAlert ||
    (servicesRunningInFuture === false &&
      servicesRunningOnServiceDate === false)
  );
}

/**
 * Resolves the schedule status shown for a stop on the map popover and the
 * stop page.
 *
 * @param {object} params
 * @param {boolean} params.showStopStatusMarkers whether the config enables stop status markers
 * @param {boolean} params.closedByServiceAlert stop is closed by a service alert
 * @param {boolean} params.servicesRunningOnServiceDate services run on the current service date
 * @param {boolean} params.servicesRunningInFuture services run on a future service date
 * @param {string} [params.alertSeverityLevel] severity of the stop's active alert
 * @returns {string|null} one of STOP_STATUS values or null when no status applies
 */
export default function getStopStatus({
  showStopStatusMarkers,
  closedByServiceAlert,
  servicesRunningOnServiceDate,
  servicesRunningInFuture,
  alertSeverityLevel,
}) {
  if (!showStopStatusMarkers) {
    return null;
  }
  if (
    isStopOutOfService({
      closedByServiceAlert,
      servicesRunningOnServiceDate,
      servicesRunningInFuture,
    })
  ) {
    return STOP_STATUS.OUT_OF_SERVICE;
  }
  if (servicesRunningOnServiceDate === false) {
    return STOP_STATUS.NO_SERVICE_TODAY;
  }
  return severityToStatus(alertSeverityLevel);
}

/**
 * Statuses drawn with a red icon (out of service or a warning/severe alert).
 */
const RED_LEVEL_STATUSES = [STOP_STATUS.OUT_OF_SERVICE, STOP_STATUS.ALERT];

/**
 * Combines the statuses of the two stops that form a hybrid (double) stop into
 * the single status shown on the shared map icon.
 *
 * - When both stops share the same status, that status is used.
 * - When one stop has no status (`null`), the other stop's status is used directly.
 * - When the statuses differ but both are red-level (out of service or alert),
 *   the ALERT status (red triangle) is used.
 * - When the statuses differ otherwise, the INFO status (gray info icon) is
 *   used to indicate that the stops differ and details are in the popover.
 *
 * @param {string|null} statusA the first stop's status
 * @param {string|null} statusB the second stop's status
 * @returns {string|null} the combined status or null when both stops have none
 */
export function combineStopStatuses(statusA, statusB) {
  if (statusA === statusB) {
    return statusA;
  }
  if (statusA === null) {
    return statusB;
  }
  if (statusB === null) {
    return statusA;
  }
  if (
    RED_LEVEL_STATUSES.includes(statusA) &&
    RED_LEVEL_STATUSES.includes(statusB)
  ) {
    return STOP_STATUS.ALERT;
  }
  return STOP_STATUS.INFO;
}

/**
 * Returns all unique alert effects from alerts that are valid at the given time,
 * filtered to the highest severity tier present. When any ALERT-tier alert
 * (SEVERE, WARNING, or UNKNOWN_SEVERITY) is active, INFO-level alert effects
 * are excluded so they don't dilute the displayed labels.
 *
 * @param {Array} alerts the stop's alerts
 * @param {number} nowUnixTime reference unix time (seconds) for alert validity
 * @returns {string[]} list of unique active alert effects at the dominant severity tier
 */
export function getStopAlertEffects(alerts, nowUnixTime) {
  const activeAlerts = (alerts || []).filter(
    alert => alert && isAlertValid(alert, nowUnixTime),
  );
  const maxSeverity = getMaximumAlertSeverityLevel(activeAlerts);
  const isAlertTier = maxSeverity !== AlertSeverityLevelType.Info;
  const relevantAlerts = isAlertTier
    ? activeAlerts.filter(
        a => a.alertSeverityLevel !== AlertSeverityLevelType.Info,
      )
    : activeAlerts;
  return [...new Set(relevantAlerts.map(a => a.alertEffect).filter(Boolean))];
}

/**
 * Prefix for disruption-effect translation message IDs (e.g. 'disruption-badge-detour').
 */
export const DISRUPTION_BADGE_PREFIX = 'disruption-badge-';

/**
 * Maps each STOP_STATUS value to its translation message ID.
 * Used by StopScheduleStatus and the no-departures panels.
 */
export const STOP_STATUS_MESSAGE_IDS = {
  [STOP_STATUS.OUT_OF_SERVICE]: 'stop-out-of-service',
  [STOP_STATUS.NO_SERVICE_TODAY]: 'stop-no-service-today',
  [STOP_STATUS.ALERT]: 'stop-has-alert',
  [STOP_STATUS.INFO]: 'stop-has-info',
};

/**
 * Maps each STOP_STATUS value to the sprite id of its corner badge icon.
 */
export const STOP_STATUS_BADGE_IMGS = {
  [STOP_STATUS.OUT_OF_SERVICE]: 'icon_stop-closed-badge',
  [STOP_STATUS.ALERT]: 'icon_caution-badge',
  [STOP_STATUS.INFO]: 'icon_info-circled-badge',
  [STOP_STATUS.NO_SERVICE_TODAY]: 'icon_stop-temporarily-closed-badge',
};

/**
 * Resolves the badge icon, stop status, and alert effects shown on the
 * "no departures" panel of a stop or terminal page.
 *
 * Priority order:
 * 1. Stop closed by a NO_SERVICE alert: `OUT_OF_SERVICE`
 * 2. No departures in the next 90 days: `OUT_OF_SERVICE`
 * 3. Active ALERT-tier alert (WARNING/SEVERE): `ALERT` with severity-filtered effects
 * 4. Fallback: `NO_SERVICE_TODAY` — INFO-level alerts do not override the service
 *    calendar; only ALERT-tier alerts (step 3) can.
 *
 * @param {Array} alerts the stop's alerts
 * @param {number} currentTime reference unix time (seconds) for alert validity
 * @param {boolean} showStopStatusMarkers whether the config enables stop status markers
 * @param {boolean} [servicesRunningInFuture] whether any departure exists in the next 90 days.
 *   Pass `false` to trigger the service-calendar-based `OUT_OF_SERVICE` path.
 *   When `true` or `undefined`, the function returns `NO_SERVICE_TODAY` as the fallback.
 * @returns {{ stopStatus: string|null, badgeImg: string|null, alertEffects: string[]|null }}
 */
export function resolveNoDeparturesBadge(
  alerts,
  currentTime,
  showStopStatusMarkers,
  servicesRunningInFuture,
) {
  if (!showStopStatusMarkers) {
    return { stopStatus: null, badgeImg: null, alertEffects: null };
  }
  const activeAlerts = (alerts || []).filter(a => isAlertValid(a, currentTime));
  const closedByServiceAlert = activeAlerts.some(
    a => a.alertEffect === 'NO_SERVICE',
  );
  if (closedByServiceAlert) {
    return {
      stopStatus: STOP_STATUS.OUT_OF_SERVICE,
      badgeImg: STOP_STATUS_BADGE_IMGS[STOP_STATUS.OUT_OF_SERVICE],
      alertEffects: null,
    };
  }
  if (servicesRunningInFuture === false) {
    return {
      stopStatus: STOP_STATUS.OUT_OF_SERVICE,
      badgeImg: STOP_STATUS_BADGE_IMGS[STOP_STATUS.OUT_OF_SERVICE],
      alertEffects: null,
    };
  }
  const maxSeverity = getMaximumAlertSeverityLevel(activeAlerts);
  if (severityToStatus(maxSeverity) === STOP_STATUS.ALERT) {
    const effects = [
      ...new Set(
        activeAlerts
          .filter(a => a.alertSeverityLevel !== AlertSeverityLevelType.Info)
          .map(a => a.alertEffect)
          .filter(Boolean),
      ),
    ];
    return {
      stopStatus: STOP_STATUS.ALERT,
      badgeImg: STOP_STATUS_BADGE_IMGS[STOP_STATUS.ALERT],
      alertEffects: effects.length > 0 ? effects : null,
    };
  }
  return {
    stopStatus: STOP_STATUS.NO_SERVICE_TODAY,
    badgeImg: STOP_STATUS_BADGE_IMGS[STOP_STATUS.NO_SERVICE_TODAY],
    alertEffects: null,
  };
}

/**
 * Derives the schedule status from a stop's GraphQL alerts and stoptimes. The
 * map's vector tile derives `servicesRunningInFuture` from the feed's service
 * calendar; here it is approximated by checking for any upcoming departure.
 *
 * @param {object} params
 * @param {object} params.stop the stop GraphQL data (alerts, stoptimes)
 * @param {number} params.nowUnixTime reference unix time (seconds) for alert validity
 * @param {boolean} params.showStopStatusMarkers whether the config enables stop status markers
 * @returns {string|null} one of STOP_STATUS values or null when no status applies
 */
export function getStopStatusFromStopData({
  stop,
  nowUnixTime,
  showStopStatusMarkers,
}) {
  if (!showStopStatusMarkers || !stop) {
    return null;
  }
  const activeAlerts = (stop.alerts || []).filter(
    alert => alert && isAlertValid(alert, nowUnixTime),
  );
  const closedByServiceAlert = activeAlerts.some(
    alert => alert.alertEffect === 'NO_SERVICE',
  );
  const servicesRunningOnServiceDate = (stop.serviceToday || []).length > 0;
  const servicesRunningInFuture =
    (stop.stoptimesWithoutPatterns || []).length > 0;

  return getStopStatus({
    showStopStatusMarkers,
    closedByServiceAlert,
    servicesRunningOnServiceDate,
    servicesRunningInFuture,
    alertSeverityLevel: getMaximumAlertSeverityLevel(activeAlerts),
  });
}
