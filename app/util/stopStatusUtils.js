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
  if (
    RED_LEVEL_STATUSES.includes(statusA) &&
    RED_LEVEL_STATUSES.includes(statusB)
  ) {
    return STOP_STATUS.ALERT;
  }
  return STOP_STATUS.INFO;
}

/**
 * Returns the alert effect (e.g. DETOUR, SIGNIFICANT_DELAYS) of the
 * highest-severity alert that is valid at the given time. Used to label the
 * status pill with the same `disruption-badge-*` text shown in Traffic now.
 *
 * @param {Array} alerts the stop's alerts
 * @param {number} nowUnixTime reference unix time (seconds) for alert validity
 * @returns {string|null} the dominant active alert's effect, or null
 */
export function getStopAlertEffect(alerts, nowUnixTime) {
  const activeAlerts = (alerts || []).filter(
    alert => alert && isAlertValid(alert, nowUnixTime),
  );
  const level = getMaximumAlertSeverityLevel(activeAlerts);
  if (!level) {
    return null;
  }
  const dominant =
    activeAlerts.find(alert => alert.alertSeverityLevel === level) ||
    activeAlerts[0];
  return (dominant && dominant.alertEffect) || null;
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
  const servicesRunningOnServiceDate = (
    stop.stoptimesForServiceDate || []
  ).some(pattern => pattern.stoptimes && pattern.stoptimes.length > 0);
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
