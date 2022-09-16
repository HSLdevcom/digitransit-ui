import find from 'lodash/find';
import get from 'lodash/get';
import isNumber from 'lodash/isNumber';
import uniqBy from 'lodash/uniqBy';
import isEmpty from 'lodash/isEmpty';
import groupBy from 'lodash/groupBy';
import PropTypes from 'prop-types';
import routeNameCompare from '@digitransit-search-util/digitransit-search-util-route-name-compare';
import { getRouteMode } from './modeUtils';

import {
  RealtimeStateType,
  AlertSeverityLevelType,
  AlertEffectType,
} from '../constants';

/**
 * Checks if the alert is for the given pattern.
 *
 * @param {*} alert the alert object to check.
 * @param {*} patternId the pattern's id, optional.
 */
export const patternIdPredicate = (alert: any, patternId = undefined) =>
  patternId
    ? (alert && !alert.trip) ||
      get(alert, 'trip.pattern.code', undefined) === patternId
    : true;

/**
 * Checks if the stop has any alerts.
 *
 * @param {*} stop the stop object to check.
 */
export const stopHasServiceAlert = (stop: any) => {
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
export const routeHasServiceAlert = (route: any, patternId = undefined) => {
  if (!route || !Array.isArray(route.alerts)) {
    return false;
  }
  return route.alerts.some((alert: any) =>
    patternIdPredicate(alert, patternId),
  );
};

/**
 * Checks if the route related to the given pattern has any alerts.
 *
 * @param {*} pattern the pattern object to check.
 */
export const patternHasServiceAlert = (pattern: any) => {
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
export const stoptimeHasCancelation = (stoptime: any) => {
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
export const tripHasCancelationForStop = (trip: any, stop: any) => {
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
      .some((st: any) => st.stop && st.stop.gtfsId === stop.gtfsId);
  }
  return trip.stoptimes
    .filter(stoptimeHasCancelation)
    .some((st: any) => st.stop && st.stop.gtfsId === stop.gtfsId);
};

/**
 * Checks if the trip has a cancelation.
 *
 * @param {*} trip the trip object to check.
 */
export const tripHasCancelation = (trip: any) => {
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
export const patternHasCancelation = (pattern: any) => {
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
export const routeHasCancelation = (route: any, patternId = undefined) => {
  if (!route || !Array.isArray(route.patterns)) {
    return false;
  }
  return route.patterns
    .filter((pattern: any) => (patternId ? patternId === pattern.code : true))
    .some(patternHasCancelation);
};

/**
 * Checks if the leg has a cancelation.
 *
 * @param {*} leg the leg object to check.
 */
export const legHasCancelation = (leg: any) => {
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
  alert: any,
  referenceUnixTime: any,
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
  { scheduledArrival, scheduledDeparture, serviceDay }: any = {},
  referenceUnixTime: any,
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
export const itineraryHasCancelation = (itinerary: any) => {
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
export const getCancelationsForRoute = (route: any, patternId = undefined) => {
  if (!route || !Array.isArray(route.patterns)) {
    return [];
  }
  return route.patterns
    .filter((pattern: any) => (patternId ? pattern.code === patternId : true))
    .map((pattern: any) => pattern.trips || [])
    .reduce((a: any, b: any) => a.concat(b), [])
    .map((trip: any) => trip.stoptimes || [])
    .reduce((a: any, b: any) => a.concat(b), [])
    .filter(stoptimeHasCancelation);
};

/**
 * Retrieves canceled stoptimes for the given stop.
 *
 * @param {*} stop the stop to get cancelations for.
 */
export const getCancelationsForStop = (stop: any) => {
  if (!stop || !Array.isArray(stop.stoptimes)) {
    return [];
  }
  return stop.stoptimes.filter(stoptimeHasCancelation);
};

const getTranslation = (translations: any, defaultValue: any, locale: any) => {
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
export const getServiceAlertHeader = (alert: any, locale = 'en') =>
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
export const getServiceAlertDescription = (alert: any, locale = 'en') =>
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
export const getServiceAlertUrl = (alert: any, locale = 'en') =>
  getTranslation(alert.alertUrlTranslations, alert.alertUrl || '', locale);

/**
 * Maps the OTP-style Service Alert's properties that
 * are most relevant to deciding whether the alert should be
 * shown to the user.
 *
 * @param {*} alert the Service Alert to map.
 */
export const getServiceAlertMetadata = (alert = {}) => ({
  // @ts-expect-error TS(2339): Property 'alertSeverityLevel' does not exist on ty... Remove this comment to see the full error message
  severityLevel: alert.alertSeverityLevel,
  validityPeriod: {
    // @ts-expect-error TS(2339): Property 'effectiveStartDate' does not exist on ty... Remove this comment to see the full error message
    startTime: alert.effectiveStartDate,
    // @ts-expect-error TS(2339): Property 'effectiveEndDate' does not exist on type... Remove this comment to see the full error message
    endTime: alert.effectiveEndDate,
  },
});

const getServiceAlerts = (
  { alerts }: any = {},
  { color, mode, shortName, routeGtfsId, stopGtfsId, type }: any = {},
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
 * @param {*} route the route object to retrieve alerts from.
 * @param {string} patternId the pattern's id, optional.
 * @param {*} locale the locale to use, defaults to 'en'.
 */
export const getServiceAlertsForRoute = (
  route: any,
  patternId = undefined,
  locale = 'en',
) => {
  if (!route || !Array.isArray(route.alerts)) {
    return [];
  }
  return getServiceAlerts(
    {
      alerts: route.alerts.filter((alert: any) =>
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
export const getServiceAlertsForStop = (stop: any, locale = 'en') =>
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
  isTerminal: any,
  stop: any,
  locale = 'en',
) => {
  const alerts =
    isTerminal && stop.stops
      ? stop.stops
          .map((terminalStop: any) =>
            getServiceAlertsForStop(terminalStop, locale),
          )
          .filter((arr: any) => arr.length > 0)
      : [];
  return alerts.reduce((a: any, b: any) => a.concat(b), []);
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
  route: any,
  patternId: any,
  locale = 'en',
) => {
  if (!route || !Array.isArray(route.patterns)) {
    return [];
  }
  return route.patterns
    .filter((pattern: any) => patternId === pattern.code)
    .map((pattern: any) => pattern.stops)
    .reduce((a: any, b: any) => a.concat(b), [])
    .map((stop: any) => getServiceAlerts(stop, route, locale))
    .reduce((a: any, b: any) => a.concat(b), []);
};

/**
 * Retrieves OTP-style Service Alerts from the given stop's
 * stoptimes' trips' routes and maps them to the format understood
 * by the UI.
 *
 * @param {*} stop the stop object to retrieve alerts from.
 * @param {*} locale the locale to use, defaults to 'en'.
 */
export const getServiceAlertsForStopRoutes = (stop: any, locale = 'en') => {
  if (!stop || !Array.isArray(stop.stoptimes)) {
    return [];
  }
  return (
    uniqBy(
      stop.stoptimes
        .map((stoptime: any) => stoptime.trip)
        .map((trip: any) => ({
          ...trip.route,
          patternId: (trip.pattern && trip.pattern.code) || undefined,
        })),
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      route => route.shortName,
    )
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      .map(route => getServiceAlertsForRoute(route, route.patternId, locale))
      .reduce((a, b) => a.concat(b), [])
  );
};

const isValidArray = (array: any) => Array.isArray(array) && array.length > 0;

/**
 * Iterates through the alerts and returns the highest severity level found.
 * Order of severity (in descending order): Severe, Warning, Info, Unknown.
 * Returns undefined if the severity level cannot be determined.
 *
 * @param {*} alerts the alerts to check.
 */
export const getMaximumAlertSeverityLevel = (alerts: any) => {
  if (!isValidArray(alerts)) {
    return undefined;
  }
  const levels = alerts
    .map((alert: any) => alert.alertSeverityLevel || alert.severityLevel)
    .reduce((obj: any, level: any) => {
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
export const getActiveAlertSeverityLevel = (
  alerts: any,
  referenceUnixTime: any,
) => {
  if (!isValidArray(alerts)) {
    return undefined;
  }
  return getMaximumAlertSeverityLevel(
    alerts
      .filter((alert: any) => !!alert)
      .map((alert: any) =>
        alert.validityPeriod ? { ...alert } : getServiceAlertMetadata(alert),
      )
      .filter((alert: any) => isAlertValid(alert, referenceUnixTime)),
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
export const getMaximumAlertEffect = (alerts: any) => {
  if (!isValidArray(alerts)) {
    return undefined;
  }
  const effects = alerts
    .map((alert: any) => alert.alertEffect)
    .reduce((obj: any, effect: any) => {
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
  referenceUnixTime: any,
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
 * @param {*} leg the itinerary leg to check.
 */
export const getActiveLegAlertSeverityLevel = (leg: any) => {
  if (!leg) {
    return undefined;
  }
  if (legHasCancelation(leg)) {
    return AlertSeverityLevelType.Warning;
  }

  const serviceAlerts = [
    ...getServiceAlertsForRoute(
      leg.route,
      leg.trip && leg.trip.pattern && leg.trip.pattern.code,
    ),
    ...getServiceAlertsForStop(leg.from && leg.from.stop),
    ...getServiceAlertsForStop(leg.to && leg.to.stop),
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
export const getActiveLegAlerts = (
  leg: any,
  legStartTime: any,
  locale = 'en',
) => {
  if (!leg) {
    return undefined;
  }
  const serviceAlerts = [
    ...getServiceAlertsForRoute(
      leg.route,
      leg.trip && leg.trip.pattern && leg.trip.pattern.code,
      locale,
    ),
    ...getServiceAlertsForStop(leg.from && leg.from.stop, locale),
    ...getServiceAlertsForStop(leg.to && leg.to.stop, locale),
    // @ts-expect-error TS(2322): Type '{}' is not assignable to type 'never'.
  ].filter(alert => isAlertActive([{}], alert, legStartTime) !== false);

  return serviceAlerts;
};

/**
 * Compares the given alerts in order to sort them.
 *
 * @param {*} a the first alert to compare.
 * @param {*} b the second alert to compare.
 */
export const alertCompare = (a: any, b: any) => {
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
export const alertSeverityCompare = (a: any, b: any) => {
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
  serviceAlerts: any,
  cancelations: any,
  currentTime: any,
  showExpired: any,
) => {
  const hasRoute = (alert: any) => alert && !isEmpty(alert.route);
  const hasStop = (alert: any) => alert && !isEmpty(alert.stop);

  const getRoute = (alert: any) => alert.route || {};
  const getMode = (alert: any) => getRoute(alert).mode;
  const getShortName = (alert: any) => getRoute(alert).shortName;
  const getRouteGtfsId = (alert: any) => getRoute(alert).gtfsId;
  const getRouteColor = (alert: any) => getRoute(alert).color;

  const getStop = (alert: any) => alert.stop || {};
  const getVehicleMode = (alert: any) => getStop(alert).vehicleMode;
  const getCode = (alert: any) => getStop(alert).code;
  const getStopGtfsId = (alert: any) => getStop(alert).gtfsId;
  const getStopName = (alert: any) => getStop(alert).name;

  const getGroupKey = (alert: any) =>
    `${alert.severityLevel}${
      (hasRoute(alert) && `route_${getMode(alert)}`) ||
      (hasStop(alert) && `stop_${getVehicleMode(alert)}`)
    }${alert.header}${alert.description}`;
  const getUniqueId = (alert: any) =>
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
  alertHash: PropTypes.number,
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

export const mapAlertSource = (config: any, lang: any, feedName: any) => {
  if (
    config &&
    config.sourceForAlertsAndDisruptions &&
    config.sourceForAlertsAndDisruptions[feedName]
  ) {
    return config.sourceForAlertsAndDisruptions[feedName][lang].concat(': ');
  }
  return '';
};
