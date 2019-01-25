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

/**
 * Checks if the trip has a cancelation.
 *
 * @param {*} trip the trip object to check.
 */
export const tripHasCancelation = trip => {
  if (!trip || !Array.isArray(trip.stoptimes)) {
    return false;
  }
  return trip.stoptimes.every(stoptimeHasCancelation);
};

/**
 * Checks if the pattern has a cancelation.
 *
 * @param {*} pattern the pattern object to check.
 */
export const patternHasCancelation = pattern => {
  if (!pattern || !Array.isArray(pattern.trips)) {
    return false;
  }
  return pattern.trips.some(tripHasCancelation);
};

/**
 * Checks if the route has a cancelation.
 *
 * @param {*} route the route object to check.
 * @param {string} patternId the pattern's id, optional.
 */
export const routeHasCancelation = (route, patternId = undefined) => {
  if (!route || !Array.isArray(route.patterns)) {
    return false;
  }
  return route.patterns
    .filter(pattern => (patternId ? patternId === pattern.code : true))
    .some(patternHasCancelation);
};
