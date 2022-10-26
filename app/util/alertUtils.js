import find from 'lodash/find';
import isNumber from 'lodash/isNumber';
import uniqBy from 'lodash/uniqBy';
import isEmpty from 'lodash/isEmpty';
import groupBy from 'lodash/groupBy';
import routeNameCompare from '@digitransit-search-util/digitransit-search-util-route-name-compare';
import { getRouteMode } from './modeUtils';

import {
  RealtimeStateType,
  AlertSeverityLevelType,
  AlertEffectType,
} from '../constants';

/**
 * Checks if the alert is for the given pattern code.
 *
 * @param {Object.<string, *>} alert the alert object to check.
 * @param {string} patternId the pattern's id, optional.
 */
export const patternIdPredicate = (alert, patternId = undefined) => {
  if (!alert) {
    return false;
  }

  if (!patternId) {
    return true;
  }

  if (!alert.entities) {
    return true;
  }

  return Boolean(
    alert.entities?.find(
      alertEntity =>
        // eslint-disable-next-line no-underscore-dangle
        alertEntity.__typename === 'Route' &&
        alertEntity?.patterns?.some(({ code }) => code === patternId),
    ),
  );
};

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
  return route.alerts.some(alert => patternIdPredicate(alert, patternId));
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
  if (
    !trip ||
    (!Array.isArray(trip.stoptimes) && !Array.isArray(trip.stoptimesForDate)) ||
    !stop ||
    !stop.gtfsId
  ) {
    return false;
  }
  if (Array.isArray(trip.stoptimesForDate)) {
    return trip.stoptimesForDate
      .filter(stoptimeHasCancelation)
      .some(st => st.stop && st.stop.gtfsId === stop.gtfsId);
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
  if (
    !trip ||
    (!Array.isArray(trip.stoptimes) && !Array.isArray(trip.stoptimesForDate))
  ) {
    return false;
  }
  if (Array.isArray(trip.stoptimesForDate)) {
    return trip.stoptimesForDate.every(stoptimeHasCancelation);
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
 * The default validity period (5 minutes) for an alert without a set end time.
 */
export const DEFAULT_VALIDITY = 5 * 60;

/**
 * Checks if the given validity period is valid or not.
 *
 * @param {{ startTime: number, endTime: number }} validityPeriod the validity period to check.
 * @param {number} referenceUnixTime the reference unix time stamp (in seconds).
 * @param {number} defaultValidity the default validity period length in seconds.
 */
export const isAlertValid = (
  alert,
  referenceUnixTime,
  { defaultValidity = DEFAULT_VALIDITY, isFutureValid = false } = {},
) => {
  if (!alert) {
    return false;
  }
  const { validityPeriod } = alert;
  if (!validityPeriod || !isNumber(referenceUnixTime)) {
    return true;
  }
  const { startTime, endTime } = validityPeriod;
  if (!startTime && !endTime) {
    return true;
  }
  if (isFutureValid && referenceUnixTime < startTime) {
    return true;
  }

  return (
    startTime <= referenceUnixTime &&
    referenceUnixTime <= (endTime || startTime + defaultValidity)
  );
};

/**
 * Checks if the given (canceled) stoptime has expired or not.
 *
 * @param {*} stoptime the stoptime to check.
 * @param {*} referenceUnixTime the reference unix time stamp (in seconds).
 */
export const cancelationHasExpired = (
  { scheduledArrival, scheduledDeparture, serviceDay } = {},
  referenceUnixTime,
) =>
  !isAlertValid(
    {
      validityPeriod: {
        startTime: serviceDay + scheduledArrival,
        endTime: serviceDay + scheduledDeparture,
      },
    },
    referenceUnixTime,
    { isFutureValid: true },
  );

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

/**
 * Retrieves canceled stoptimes for the given route.
 *
 * @param {*} route the route to get cancelations for.
 * @param {*} patternId the pattern's id, optional.
 */
export const getCancelationsForRoute = (route, patternId = undefined) => {
  if (!route || !Array.isArray(route.patterns)) {
    return [];
  }
  return route.patterns
    .filter(pattern => (patternId ? pattern.code === patternId : true))
    .map(pattern => pattern.trips || [])
    .reduce((a, b) => a.concat(b), [])
    .map(trip => trip.stoptimes || [])
    .reduce((a, b) => a.concat(b), [])
    .filter(stoptimeHasCancelation);
};

/**
 * Retrieves canceled stoptimes for the given stop.
 *
 * @param {*} stop the stop to get cancelations for.
 */
export const getCancelationsForStop = stop => {
  if (!stop || !Array.isArray(stop.stoptimes)) {
    return [];
  }
  return stop.stoptimes.filter(stoptimeHasCancelation);
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
 * @param {*} locale the locale to use, defaults to 'en'.
 */
export const getServiceAlertDescription = (alert, locale = 'en') =>
  getTranslation(
    alert.alertDescriptionTextTranslations,
    alert.alertDescriptionText || '',
    locale,
  );

/**
 * Attempts to find alert's url in the given language.
 *
 * @param {*} alert the alert object to look into.
 * @param {*} locale the locale to use, defaults to 'en'.
 */
export const getServiceAlertUrl = (alert, locale = 'en') =>
  getTranslation(alert.alertUrlTranslations, alert.alertUrl || '', locale);

/**
 * Maps the OTP-style Service Alert's properties that
 * are most relevant to deciding whether the alert should be
 * shown to the user.
 *
 * @param {*} alert the Service Alert to map.
 */
export const getServiceAlertMetadata = (alert = {}) => ({
  severityLevel: alert.alertSeverityLevel,
  validityPeriod: {
    startTime: alert.effectiveStartDate,
    endTime: alert.effectiveEndDate,
  },
});

/**
 * @param {Object.<string, *>} entityWithAlert
 * @param {Object.<atring, *>} route
 * @param {string} [locale]
 * @returns {Array.<Object.<string,*>>} formatted alerts
 */
const getServiceAlerts = (
  { alerts } = {},
  { color, mode, shortName, routeGtfsId, stopGtfsId, type } = {},
  locale = 'en',
) =>
  Array.isArray(alerts)
    ? alerts.map(alert => ({
        ...getServiceAlertMetadata(alert),
        description: getServiceAlertDescription(alert, locale),
        hash: alert.alertHash,
        header: getServiceAlertHeader(alert, locale),
        route: {
          color,
          mode,
          shortName,
          type,
          gtfsId: routeGtfsId,
        },
        stop: {
          gtfsId: stopGtfsId,
        },
        url: getServiceAlertUrl(alert, locale),
      }))
    : [];

/**
 * Retrieves OTP-style Service Alerts from the given route and
 * maps them to the format understood by the UI.
 *
 * @param {Object.<string,*>} route the route object to retrieve alerts from.
 * @param {string} patternId the pattern's id, optional.
 * @param {string} [locale] the locale to use, defaults to 'en'.
 */
export const getServiceAlertsForRoute = (
  route,
  patternId = undefined,
  locale = 'en',
) => {
  if (!route || !Array.isArray(route.alerts)) {
    return [];
  }

  return getServiceAlerts(
    {
      alerts: route.alerts.filter(alert =>
        patternIdPredicate(alert, patternId),
      ),
    },
    { ...route, routeGtfsId: route && route.gtfsId },
    locale,
  );
};

/**
 * Retrieves OTP-style Service Alerts from the given stop and
 * maps them to the format understood by the UI.
 *
 * @param {*} stop the stop object to retrieve alerts from.
 * @param {*} locale the locale to use, defaults to 'en'.
 */
export const getServiceAlertsForStop = (stop, locale = 'en') =>
  getServiceAlerts(stop, { stopGtfsId: stop && stop.gtfsId }, locale);

/**
 * Retrieves OTP-style Service Alerts from the given Terminal stop's stops  and
 * maps them to the format understood by the UI. Filter out empty arrays from alerts.
 *
 * @param {boolean} isTerminal Check that this stop is indeed terminal.
 * @param {string} stop the stop object to retrieve alerts from.
 * @param {*} locale the locale to use, defaults to 'en'.
 */
export const getServiceAlertsForTerminalStops = (
  isTerminal,
  stop,
  locale = 'en',
) => {
  const alerts =
    isTerminal && stop.stops
      ? stop.stops
          .map(terminalStop => getServiceAlertsForStop(terminalStop, locale))
          .filter(arr => arr.length > 0)
      : [];
  return alerts.reduce((a, b) => a.concat(b), []);
};

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
) => {
  if (!route || !Array.isArray(route.patterns)) {
    return [];
  }
  return route.patterns
    .filter(pattern => patternId === pattern.code)
    .map(pattern => pattern.stops)
    .reduce((a, b) => a.concat(b), [])
    .map(stop => getServiceAlerts(stop, route, locale))
    .reduce((a, b) => a.concat(b), []);
};

/**
 * Retrieves OTP-style Service Alerts from the given stop's
 * stoptimes' trips' routes and maps them to the format understood
 * by the UI.
 *
 * @param {*} stop the stop object to retrieve alerts from.
 * @param {*} locale the locale to use, defaults to 'en'.
 */
export const getServiceAlertsForStopRoutes = (stop, locale = 'en') => {
  if (!stop || !Array.isArray(stop.stoptimes)) {
    return [];
  }
  return uniqBy(
    stop.stoptimes
      .map(stoptime => stoptime.trip)
      .map(trip => ({
        ...trip.route,
        patternId: (trip.pattern && trip.pattern.code) || undefined,
      })),
    route => route.shortName,
  )
    .map(route => getServiceAlertsForRoute(route, route.patternId, locale))
    .reduce((a, b) => a.concat(b), []);
};

/**
 * Retrieves OTP-style Service Alerts for trip on route and maps them
 * to the format understood by the UI.
 *
 * @param {Object.<string,*>} trip
 * @param {Object.<string,*>} route
 * @param {string} [locale]
 *
 * @returns {Array.<Object.<string,*>>}
 */
const getServiceAlertsForTrip = (trip, route, locale = 'en') =>
  trip?.alerts
    ? getServiceAlerts(
        trip,
        { ...(route || []), routeGtfsId: route?.gtfsId },
        locale,
      )
    : [];

const isValidArray = array => Array.isArray(array) && array.length > 0;

/**
 * Iterates through the alerts and returns the highest severity level found.
 * Order of severity (in descending order): Severe, Warning, Info, Unknown.
 * Returns undefined if the severity level cannot be determined.
 *
 * @param {*} alerts the alerts to check.
 */
export const getMaximumAlertSeverityLevel = alerts => {
  if (!isValidArray(alerts)) {
    return undefined;
  }
  const levels = alerts
    .map(alert => alert.alertSeverityLevel || alert.severityLevel)
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
 * Checks if any of the alerts is active at the given time and
 * returns its severity level.
 *
 * @param {*} alerts the alerts to check.
 * @param {*} referenceUnixTime the reference unix time stamp (in seconds).
 */
export const getActiveAlertSeverityLevel = (alerts, referenceUnixTime) => {
  if (!isValidArray(alerts)) {
    return undefined;
  }
  return getMaximumAlertSeverityLevel(
    alerts
      .filter(alert => !!alert)
      .map(alert =>
        alert.validityPeriod ? { ...alert } : getServiceAlertMetadata(alert),
      )
      .filter(alert => isAlertValid(alert, referenceUnixTime)),
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
  if (!isValidArray(alerts)) {
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
 * Checks if any of the given cancelations or alerts are active at the given time.
 *
 * @param {*} cancelations the cancelations to check.
 * @param {*} alerts the alerts to check.
 * @param {*} referenceUnixTime the reference unix time stamp (in seconds).
 */
export const isAlertActive = (
  cancelations = [],
  alerts = [],
  referenceUnixTime,
) => {
  if (
    cancelations.some(
      cancelation => !cancelationHasExpired(cancelation, referenceUnixTime),
    )
  ) {
    return true;
  }

  if (alerts.length === 0) {
    return false;
  }

  const filteredAlerts = alerts.filter(alert =>
    isAlertValid(alert, referenceUnixTime),
  );
  const alertSeverityLevel = getMaximumAlertSeverityLevel(filteredAlerts);
  return alertSeverityLevel
    ? alertSeverityLevel !== AlertSeverityLevelType.Info
    : filteredAlerts.length > 0;
};

/**
 * Checks whether the given leg has an active cancelation or an active
 * service alert.
 *
 * @param {Object.<string.*>} leg the itinerary leg to check.
 */
export const getActiveLegAlertSeverityLevel = leg => {
  if (!leg) {
    return undefined;
  }

  if (legHasCancelation(leg)) {
    return AlertSeverityLevelType.Warning;
  }

  const { route, trip } = leg;

  const serviceAlerts = [
    ...getServiceAlertsForRoute(route, trip?.pattern?.code),
    ...getServiceAlertsForStop(leg?.from?.stop),
    ...getServiceAlertsForStop(leg?.to?.stop),
    ...getServiceAlertsForTrip(trip, route),
  ];

  return getActiveAlertSeverityLevel(
    serviceAlerts,
    leg.startTime / 1000, // this field is in ms format
  );
};

/**
 * Returns an array of currently active alerts for the legs' route and origin/destination stops
 *
 * @param {*} leg the itinerary leg to check.
 * @param {*} legStartTime the reference unix time stamp (in seconds).
 * @param {*} locale the locale to use, defaults to 'en'.
 */
export const getActiveLegAlerts = (leg, legStartTime, locale = 'en') => {
  if (!leg) {
    return undefined;
  }

  const { route, trip } = leg;

  const serviceAlerts = [
    ...getServiceAlertsForRoute(route, trip?.pattern?.code, locale),
    ...getServiceAlertsForStop(leg?.from.stop, locale),
    ...getServiceAlertsForStop(leg?.to.stop, locale),
    ...getServiceAlertsForTrip(trip, route),
  ].filter(alert => isAlertActive([{}], alert, legStartTime) !== false);

  return serviceAlerts;
};

/**
 * Compares the given alerts in order to sort them.
 *
 * @param {*} a the first alert to compare.
 * @param {*} b the second alert to compare.
 */
export const alertCompare = (a, b) => {
  // sort by expiration status
  if (a.expired !== b.expired) {
    return a.expired ? 1 : -1;
  }

  // sort by missing route information (for stop level alerts)
  if (!a.route || !a.route.shortName) {
    // sort by stop information if it exists
    if (a.stop && b.stop) {
      return `${a.stop.code}`.localeCompare(`${b.stop.code}`);
    }
    return -1;
  }

  // sort by route information
  const routeOrder = routeNameCompare(a.route || {}, b.route || {});
  if (routeOrder !== 0) {
    return routeOrder;
  }

  // sort by alert validity period
  return b.validityPeriod.startTime - a.validityPeriod.startTime;
};

/**
 * Compares the given alerts in order to sort them based on severity level and affected entity.
 * The most severe alerts are sorted first, and alerts that affect routes are sorted before alerts
 * that don't affect a route.
 *
 * @param {*} a the first alert to compare.
 * @param {*} b the second alert to compare.
 */
export const alertSeverityCompare = (a, b) => {
  const severityLevels = [
    AlertSeverityLevelType.Info,
    AlertSeverityLevelType.Unknown,
    AlertSeverityLevelType.Warning,
    AlertSeverityLevelType.Severe,
  ];

  const severityLevelDifference =
    severityLevels.indexOf(b.severityLevel) -
    severityLevels.indexOf(a.severityLevel);

  if (severityLevelDifference === 0) {
    if (a.route && a.route.gtfsId) {
      return -1;
    }
    if (b.route && b.route.gtfsId) {
      return 1;
    }
  }
  return severityLevelDifference;
};

/**
 * Creates a list of unique alerts grouped under one header
 *@param {*} serviceAlerts The list of Service alerts to be mapped and filtered,
  @param {*} cancelations The list of Cancelations to be mapped and filtered,
  @param {*} currentTime The current time to check for alert validity,
  @param {*} showExpired If the expired alerts need to be shown,
 */
export const createUniqueAlertList = (
  serviceAlerts,
  cancelations,
  currentTime,
  showExpired,
) => {
  const hasRoute = alert => alert && !isEmpty(alert.route);
  const hasStop = alert => alert && !isEmpty(alert.stop);

  const getRoute = alert => alert.route || {};
  const getMode = alert => getRoute(alert).mode;
  const getShortName = alert => getRoute(alert).shortName;
  const getRouteGtfsId = alert => getRoute(alert).gtfsId;
  const getRouteColor = alert => getRoute(alert).color;

  const getStop = alert => alert.stop || {};
  const getVehicleMode = alert => getStop(alert).vehicleMode;
  const getCode = alert => getStop(alert).code;
  const getStopGtfsId = alert => getStop(alert).gtfsId;
  const getStopName = alert => getStop(alert).name;

  const getGroupKey = alert =>
    `${alert.severityLevel}${
      (hasRoute(alert) && `route_${getMode(alert)}`) ||
      (hasStop(alert) && `stop_${getVehicleMode(alert)}`)
    }${alert.header}${alert.description}`;
  const getUniqueId = alert =>
    `${getShortName(alert) || getCode(alert)}${getGroupKey(alert)}`;

  const uniqueAlerts = uniqBy(
    [
      ...(Array.isArray(cancelations)
        ? cancelations
            .map(cancelation => ({
              ...cancelation,
              severityLevel: AlertSeverityLevelType.Warning,
              expired: !isAlertValid(cancelation, currentTime, {
                isFutureValid: true,
              }),
            }))
            .filter(alert => (showExpired ? true : !alert.expired))
        : []),
      ...(Array.isArray(serviceAlerts)
        ? serviceAlerts
            .map(alert => ({
              ...alert,
              expired: !isAlertValid(alert, currentTime),
            }))
            .filter(alert => (showExpired ? true : !alert.expired))
        : []),
    ],
    getUniqueId,
  );

  const alertGroups = groupBy(uniqueAlerts, getGroupKey);

  const groupedAlerts = Object.keys(alertGroups).map(key => {
    const alerts = alertGroups[key];
    const alert = alerts[0];
    return {
      ...alert,
      route:
        (hasRoute(alert) && {
          mode: getRouteMode(alert.route),
          routeGtfsId: alerts.sort(alertCompare).map(getRouteGtfsId).join(','),
          shortName: alerts.sort(alertCompare).map(getShortName).join(', '),
          color: getRouteColor(alert),
          type: getRoute(alert).type,
        }) ||
        undefined,
      stop:
        (hasStop(alert) && {
          stopGtfsId: alerts.sort(alertCompare).map(getStopGtfsId).join(','),
          code: alerts.sort(alertCompare).map(getCode).join(', '),
          vehicleMode: getVehicleMode(alert),
          nameAndCode: alerts
            .sort(alertCompare)
            .map(a => {
              const stopName = getStopName(a);
              const stopCode = getCode(a);
              return (
                (stopName && stopCode && `${stopName} (${stopCode})`) ||
                stopName
              );
            })
            .join(', '),
        }) ||
        undefined,
    };
  });

  return groupedAlerts.sort(alertCompare);
};

/**
 * Checks whether the alert to be displayed has meaningful data (header or description) or not.
 * Used to decide whether to render the box for the alert or not.
 * @param {*} alerts list of alerts.
 */
export const hasMeaningfulData = alerts => {
  if (alerts.length === 0) {
    return false;
  }
  const alertForDisplaying = [...alerts].sort(alertSeverityCompare)[0];
  const header = getServiceAlertHeader(alertForDisplaying);
  const description = getServiceAlertDescription(alertForDisplaying);
  if (
    (header && header.length > 0) ||
    (description && description.length > 0)
  ) {
    return true;
  }
  return false;
};

export const mapAlertSource = (config, lang, feedName) => {
  if (
    config &&
    config.sourceForAlertsAndDisruptions &&
    config.sourceForAlertsAndDisruptions[feedName]
  ) {
    return config.sourceForAlertsAndDisruptions[feedName][lang].concat(': ');
  }
  return '';
};
