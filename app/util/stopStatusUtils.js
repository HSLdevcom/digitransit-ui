import { isAlertValid } from './alertUtils';

export const STOP_STATUS = {
  OUT_OF_SERVICE: 'out-of-service',
  NO_SERVICE_TODAY: 'no-service-today',
};

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
 * @returns {string|null} one of STOP_STATUS values or null when no status applies
 */
export default function getStopStatus({
  showStopStatusMarkers,
  closedByServiceAlert,
  servicesRunningOnServiceDate,
  servicesRunningInFuture,
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
  return null;
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
  const closedByServiceAlert = (stop.alerts || []).some(
    alert =>
      alert.alertEffect === 'NO_SERVICE' && isAlertValid(alert, nowUnixTime),
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
  });
}
