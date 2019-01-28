import find from 'lodash/find';
import PropTypes from 'prop-types';

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

const getServiceAlertHeader = (alert, locale) => {
  // Try to find the alert in user's language, or failing in English, or failing in any language
  // TODO: This should be a util function that we use everywhere
  // TODO: We should match to all languages user's browser lists as acceptable
  let header = find(alert.alertHeaderTextTranslations, ['language', locale]);
  if (!header) {
    header = find(alert.alertHeaderTextTranslations, ['language', 'en']);
  }
  if (!header) {
    [header] = alert.alertHeaderTextTranslations;
  }
  if (header) {
    header = header.text;
  }
  return header || alert.alertHeaderText;
};

const getServiceAlertDescription = (alert, locale) => {
  // Unfortunately nothing in GTFS-RT specifies that if there's one string in a language then
  // all other strings would also be available in the same language...
  let description = find(alert.alertDescriptionTextTranslations, [
    'language',
    locale,
  ]);
  if (!description) {
    description = find(alert.alertDescriptionTextTranslations, [
      'language',
      'en',
    ]);
  }
  if (!description) {
    [description] = alert.alertDescriptionTextTranslations;
  }
  if (description) {
    description = description.text;
  }
  return description || alert.alertDescriptionText;
};

/**
 * Retrieves OTP-style Service Alerts from the given route and
 * maps them to the format understood be the UI.
 *
 * @param {*} route the route object to retrieve alerts from.
 * @param {*} locale the locale to use, defaults to 'en'.
 */
export const getServiceAlertsForRoute = (route, locale = 'en') =>
  Array.isArray(route.alerts)
    ? route.alerts.map(alert => ({
        description: getServiceAlertDescription(alert, locale),
        header: getServiceAlertHeader(alert, locale),
        route: {
          color: route.color,
          mode: route.mode,
          shortName: route.shortName,
        },
        validityPeriod: {
          startTime: alert.effectiveStartDate * 1000,
          endTime: alert.effectiveEndDate * 1000,
        },
      }))
    : [];

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
  effectiveEndDate: PropTypes.number,
  effectiveStartDate: PropTypes.number,
});
