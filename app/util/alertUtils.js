import find from 'lodash/find';
import PropTypes from 'prop-types';

import {
  RealtimeStateType,
  AlertSeverityLevelType,
  AlertEffectType,
} from '../constants';

/**
 * Checks if the stop has any alerts.
 *
 * @param {*} stop the stop object to check.
 */
export const stopHasServiceAlert = stop => {
  if (!stop || !Array.isArray(stop.alerts)) {
    return false;
  }
  return stop.alerts.length > 0;
};

/**
 * Checks if the route has any alerts.
 *
 * @param {*} route the route object to check.
 * @param {string} patternId the pattern's id, optional.
 */
export const routeHasServiceAlert = (route, patternId = undefined) => {
  if (!route || !Array.isArray(route.alerts)) {
    return false;
  }
  return patternId
    ? route.alerts.some(
        alert =>
          !alert.trip ||
          (alert.trip.pattern && alert.trip.pattern.code === patternId),
      )
    : route.alerts.length > 0;
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
 * Checks if the trip has a cancelation for the given stop.
 *
 * @param {*} trip the trip object to check.
 * @param {*} stop the stop object to look a cancelation for.
 */
export const tripHasCancelationForStop = (trip, stop) => {
  if (!trip || !Array.isArray(trip.stoptimes) || !stop || !stop.gtfsId) {
    return false;
  }
  return trip.stoptimes
    .filter(stoptimeHasCancelation)
    .some(st => st.stop && st.stop.gtfsId === stop.gtfsId);
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

/**
 * Checks if the leg has a cancelation.
 *
 * @param {*} leg the leg object to check.
 */
export const legHasCancelation = leg => {
  if (!leg) {
    return false;
  }
  return leg.realtimeState === RealtimeStateType.Canceled;
};

/**
 * Checks if the itinerary has a cancelation.
 *
 * @param {*} itinerary the itinerary object to check.
 */
export const itineraryHasCancelation = itinerary => {
  if (!itinerary || !Array.isArray(itinerary.legs)) {
    return false;
  }
  return itinerary.legs.some(legHasCancelation);
};

const getTranslation = (translations, defaultValue, locale) => {
  if (!Array.isArray(translations)) {
    return defaultValue;
  }
  const translation =
    find(translations, t => t.language === locale) ||
    find(translations, t => !t.language && t.text) ||
    find(translations, t => t.language === 'en');
  return translation ? translation.text : defaultValue;
};

/**
 * Attempts to find the alert's header in the given language.
 *
 * @param {*} alert the alert object to look into.
 * @param {*} locale the locale to use, defaults to 'en'.
 */
export const getServiceAlertHeader = (alert, locale = 'en') =>
  getTranslation(
    alert.alertHeaderTextTranslations,
    alert.alertHeaderText || '',
    locale,
  );

/**
 * Attempts to find the alert's description in the given language.
 *
 * @param {*} alert the alert object to look into.
 * @param {*} locale the locale to use, default to 'en'.
 */
export const getServiceAlertDescription = (alert, locale = 'en') =>
  getTranslation(
    alert.alertDescriptionTextTranslations,
    alert.alertDescriptionText || '',
    locale,
  );

const getServiceAlerts = (
  { alerts } = {},
  { color, mode, shortName } = {},
  locale = 'en',
) =>
  Array.isArray(alerts)
    ? alerts.map(alert => ({
        description: getServiceAlertDescription(alert, locale),
        header: getServiceAlertHeader(alert, locale),
        route: {
          color,
          mode,
          shortName,
        },
        ...(alert.alertSeverityLevel && { severity: alert.alertSeverityLevel }),
        validityPeriod: {
          startTime: alert.effectiveStartDate * 1000,
          endTime: alert.effectiveEndDate * 1000,
        },
      }))
    : [];

/**
 * Retrieves OTP-style Service Alerts from the given route and
 * maps them to the format understood by the UI.
 *
 * @param {*} route the route object to retrieve alerts from.
 * @param {*} locale the locale to use, defaults to 'en'.
 */
export const getServiceAlertsForRoute = (route, locale = 'en') =>
  getServiceAlerts(route, route, locale);

/**
 * Retrieves OTP-style Service Alerts from the given stop and
 * maps them to the format understood by the UI.
 *
 * @param {*} stop the stop object to retrieve alerts from.
 * @param {*} locale the locale to use, defaults to 'en'.
 */
export const getServiceAlertsForStop = (stop, locale = 'en') =>
  getServiceAlerts(stop, {}, locale);

/**
 * Retrieves OTP-style Service Alerts from the given route's
 * pattern's stops and maps them to the format understood by the UI.
 *
 * @param {*} route the route object to retrieve alerts from.
 * @param {*} patternId the pattern's id.
 * @param {*} locale the locale to use, defaults to 'en'.
 */
export const getServiceAlertsForRouteStops = (
  route,
  patternId,
  locale = 'en',
) =>
  route.patterns
    .filter(pattern => patternId === pattern.code)
    .map(pattern => pattern.stops)
    .reduce((a, b) => a.concat(b), [])
    .map(stop => getServiceAlerts(stop, route, locale))
    .reduce((a, b) => a.concat(b), []);

/**
 * Iterates through the alerts and returns the highest severity level found.
 * Order of severity (in descending order): Severe, Warning, Info, Unknown.
 * Returns undefined if the severity level cannot be determined.
 *
 * @param {*} alerts the alerts to check.
 */
export const getMaximumAlertSeverityLevel = alerts => {
  if (!Array.isArray(alerts) || alerts.length === 0) {
    return undefined;
  }
  const levels = alerts
    .map(alert => alert.alertSeverityLevel)
    .reduce((obj, level) => {
      if (level) {
        obj[level] = level; // eslint-disable-line no-param-reassign
      }
      return obj;
    }, {});
  return (
    levels[AlertSeverityLevelType.Severe] ||
    levels[AlertSeverityLevelType.Warning] ||
    levels[AlertSeverityLevelType.Info] ||
    levels[AlertSeverityLevelType.Unknown] ||
    undefined
  );
};

/**
 * Iterates through the alerts and returns 'NO_SERVICE' if that is found.
 * Returns 'EFFECT_UNKNOWN' if there are alerts but none of them have an
 * effect of 'NO_SERVICE'. Returns undefined if the effect cannot be
 * determined.
 *
 * @param {*} alerts the alerts to check.
 */
export const getMaximumAlertEffect = alerts => {
  if (!Array.isArray(alerts) || alerts.length === 0) {
    return undefined;
  }
  const effects = alerts
    .map(alert => alert.alertEffect)
    .reduce((obj, effect) => {
      if (effect) {
        obj[effect] = effect; // eslint-disable-line no-param-reassign
      }
      return obj;
    }, {});
  return (
    effects[AlertEffectType.NoService] ||
    (Object.keys(effects).length > 0 && AlertEffectType.Unknown) ||
    undefined
  );
};

/**
 * Describes the type information for an OTP Service Alert object.
 */
export const otpServiceAlertShape = PropTypes.shape({
  alertDescriptionText: PropTypes.string,
  alertDescriptionTextTranslations: PropTypes.arrayOf(
    PropTypes.shape({
      language: PropTypes.string,
      text: PropTypes.string,
    }),
  ),
  alertHeaderText: PropTypes.string,
  alertHeaderTextTranslations: PropTypes.arrayOf(
    PropTypes.shape({
      language: PropTypes.string,
      text: PropTypes.string,
    }),
  ),
  alertSeverityLevel: PropTypes.string,
  effectiveEndDate: PropTypes.number,
  effectiveStartDate: PropTypes.number,
});
