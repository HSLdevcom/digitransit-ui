import { RealtimeStateType } from '../constants';

/**
 * Checks if the route has any alerts.
 *
 * @param {*} route the route object to check.
 */
export const routeHasServiceAlert = route => {
  if (!route || !Array.isArray(route.alerts)) {
    return false;
  }
  return route.alerts.length > 0;
};

/**
 * Checks if the route related to the given pattern has any alerts.
 *
 * @param {*} pattern the pattern object to check.
 */
export const patternHasServiceAlert = pattern => {
  if (!pattern) {
    return false;
  }
  return routeHasServiceAlert(pattern.route);
};

/**
 * Checks if the stoptime has a cancelation.
 *
 * @param {*} stoptime the stoptime object to check.
 */
export const stoptimeHasCancelation = stoptime => {
  if (!stoptime) {
    return false;
  }
  return stoptime.realtimeState === RealtimeStateType.Canceled;
};
