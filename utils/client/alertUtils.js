import isNumber from 'lodash/isNumber';
import routeNameCompare from '@digitransit-search-util/digitransit-search-util-route-name-compare';

import {
  RealtimeStateType,
  AlertSeverityLevelType,
  AlertEntityType,
} from '../shared/constants';

import { legTime } from './legUtils';

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
 * @param {number} currentTime the current unix time.
 * @param { before: number, after: number } validityPeriod validity before/after current time.
 */
export const tripHasCancelation = (trip, currentTime, validityPeriod) => {
  if (
    !trip ||
    (!Array.isArray(trip.stoptimes) && !Array.isArray(trip.stoptimesForDate))
  ) {
    return false;
  }
  const first = trip.stoptimes[0];
  const departureTime = first.serviceDay + first.scheduledDeparture;
  const last = trip.stoptimes[trip.stoptimes.length - 1];
  if (
    validityPeriod &&
    currentTime &&
    (currentTime < departureTime - validityPeriod.before ||
      currentTime >
        last.serviceDay + last.scheduledArrival + validityPeriod.after)
  ) {
    return false;
  }
  if (Array.isArray(trip.stoptimesForDate)) {
    return trip.stoptimesForDate.every(stoptimeHasCancelation);
  }
  return trip.stoptimes.every(stoptimeHasCancelation);
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
 * @param {{ effectiveStartDate: number, effectiveEndDate: number }} alert containing validity period.
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
  const { effectiveStartDate, effectiveEndDate } = alert;
  if (!effectiveStartDate || !isNumber(referenceUnixTime)) {
    return true;
  }
  if (isFutureValid && referenceUnixTime < effectiveStartDate) {
    return true;
  }

  return (
    effectiveStartDate <= referenceUnixTime &&
    referenceUnixTime <=
      (effectiveEndDate || effectiveStartDate + defaultValidity)
  );
};

/**
 * Splits alerts into currently ongoing and future alerts
 * @param {*} alerts list of alerts containing effectiveStartDate
 * @param {*} referenceTime reference Unix time
 *
 */
export const currentAndFutureAlerts = (alerts, referenceTime) => {
  const currentAlerts = alerts.filter(alert => {
    const { effectiveStartDate, effectiveEndDate } = alert;
    const endDate = effectiveEndDate || effectiveStartDate + DEFAULT_VALIDITY;
    return (
      !effectiveStartDate ||
      (effectiveStartDate <= referenceTime && endDate >= referenceTime)
    );
  });
  const futureAlerts = alerts.filter(alert => {
    const { effectiveStartDate } = alert;
    return effectiveStartDate > referenceTime;
  });
  return { currentAlerts, futureAlerts };
};

/**
 * Checks if the given (canceled) stoptime has expired or not.
 *
 * @param {*} referenceUnixTime the reference unix time stamp (in seconds).
 * @param {*} stoptime the stoptime to check.
 */
export const cancelationHasExpired = (
  referenceUnixTime,
  { scheduledArrival, scheduledDeparture, serviceDay } = {},
) =>
  !isAlertValid(
    {
      effectiveStartDate: serviceDay + scheduledArrival,
      effectiveEndDate: serviceDay + scheduledDeparture,
    },
    referenceUnixTime,
    { isFutureValid: true },
  );

/**
 * Retrieves canceled stoptimes for the given route.
 *
 * @param {*} route the route to get cancelations for.
 * @param {*} patternId the pattern's id, optional.
 * @param {number} currentTime the current unix time.
 * @param { before: number, after: number } validityPeriod validity before/after current time.
 */
export const getCancelationsForRoute = (
  route,
  patternId,
  currentTime,
  validityPeriod,
) => {
  if (!route || !Array.isArray(route.patterns)) {
    return [];
  }
  return route.patterns
    .filter(pattern => (patternId ? pattern.code === patternId : true))
    .map(pattern =>
      Array.isArray(pattern.trips)
        ? pattern.trips.filter(trip =>
            tripHasCancelation(trip, currentTime, validityPeriod),
          )
        : [],
    )
    .reduce((a, b) => a.concat(b), [])
    .map(trip => trip.stoptimes || [])
    .reduce((a, b) => a.concat(b), []);
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

/**
 * Retrieves Service Alerts from the given object (or an empty list if no alerts exist).
 * Falsy alerts are left out.
 *
 * @param {Object.<string,*>} object should contain alerts key.
 */
export const getAlertsForObject = object => {
  if (!object || !Array.isArray(object.alerts)) {
    return [];
  }

  return object.alerts.filter(alert => !!alert);
};

/**
 * Retrieves Service Alerts from the given station and its stops
 * or an empty array.
 *
 * @param {string} station the stop object to retrieve alerts from.
 */
export const getServiceAlertsForStation = station => {
  const stopAlerts = station.stops
    ? station.stops.flatMap(stop => getAlertsForObject(stop))
    : [];
  return [...getAlertsForObject(station), ...stopAlerts];
};

export const getUniqueAlerts = alerts => {
  const seen = new Set();
  return alerts.filter(alert => {
    if (seen.has(alert.alertHash)) {
      return false;
    }
    seen.add(alert.alertHash);
    return true;
  });
};

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
      .filter(alert => isAlertValid(alert, referenceUnixTime)),
  );
};

export const isAlertActive = (referenceUnixTime, alert) => {
  if (!alert) {
    return false;
  }
  return (
    isAlertValid(alert, referenceUnixTime) &&
    alert.alertSeverityLevel !== AlertSeverityLevelType.Info
  );
};

/**
 * Checks if any of the given cancelations or alerts are active at the given time.
 *
 * @param {*} referenceUnixTime the reference unix time stamp (in seconds).
 * @param {*} cancelations the cancelations to check.
 * @param {*} alerts the alerts to check.
 */
export const checkActiveDisruptions = (
  referenceUnixTime,
  cancelations = [],
  alerts = [],
) => {
  if (
    cancelations.some(
      cancelation => !cancelationHasExpired(referenceUnixTime, cancelation),
    )
  ) {
    return true;
  }

  return !!alerts.find(alert => isAlertActive(referenceUnixTime, alert));
};

/**
 * Compares the given alert entities in order to sort them based route shortName
 * or the stop name (and code).
 *
 * @param {*} entityA the first entity to compare.
 * @param {*} entityB the second entity to compare.
 */
export const entityCompare = (entityA, entityB) => {
  if (entityA.shortName) {
    return routeNameCompare(entityA, entityB);
  }
  const nameCompare = `${entityA.name}`.localeCompare(entityB.name);
  if (nameCompare !== 0) {
    return nameCompare;
  }
  if (entityA.code && entityB.code) {
    return `${entityA.code}`.localeCompare(entityB.code);
  }
  return nameCompare;
};

/**
 * Compares the given alerts in order to sort them based on severity level.
 * The most severe alerts are sorted first.
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
    severityLevels.indexOf(b.alertSeverityLevel) -
    severityLevels.indexOf(a.alertSeverityLevel);
  return severityLevelDifference;
};

/**
 * Compares the given alerts in order to sort them based on the severity,
 * entities and the validity period (in that order).
 *
 * @param {*} alertA the first alert to compare.
 * @param {*} alertB the second alert to compare.
 */
export const alertCompare = (alertA, alertB) => {
  const severityScore = alertSeverityCompare(alertA, alertB);
  if (severityScore !== 0) {
    return severityScore;
  }

  if (!alertA.entities && alertA.entities.length > 0) {
    return 1;
  }
  if (!alertB.entities && alertB.entities.length > 0) {
    return -1;
  }
  const aEntitiesSorted = [...alertA.entities].sort(entityCompare);
  const bEntitiesSorted = [...alertB.entities].sort(entityCompare);
  const bestEntitiesCompared = entityCompare(
    aEntitiesSorted[0],
    bEntitiesSorted[0],
  );
  return bestEntitiesCompared === 0
    ? alertA.effectiveStartDate - alertB.effectiveStartDate
    : bestEntitiesCompared;
};

/**
 * Checks whether the alert to be displayed has meaningful data (header or description) or not.
 * Used to decide whether to render the box for the alert or not.
 * @param {*} alerts list of alerts.
 */
export const hasMeaningfulData = alerts => {
  if (!isValidArray(alerts)) {
    return false;
  }
  const alertForDisplaying = [...alerts].sort(alertSeverityCompare)[0];
  const header = alertForDisplaying.alertHeaderText;
  const description = alertForDisplaying.alertDescriptionText;
  if (
    (header && header.length > 0) ||
    (description && description.length > 0)
  ) {
    return true;
  }
  return false;
};

export const mapAlertSource = (config, lang, feedName) => {
  if (config.sourceForAlertsAndDisruptions?.[feedName]) {
    return config.sourceForAlertsAndDisruptions[feedName][lang].concat(': ');
  }
  return '';
};

/**
 * Checks if the alert has at least one entity of the given entity type.
 *
 * @param {*} alert the alert which can contain entities.
 * @param {String} entityType the entity type.
 */
export const hasEntitiesOfType = (alert, entityType) =>
  // eslint-disable-next-line no-underscore-dangle
  alert?.entities?.some(entity => entity.__typename === entityType);

/**
 * Checks if the alert has at least one entity of the given entity type.
 *
 * @param {*} alert the alert which can contain entities.
 * @param {Array.<String>} entityTypes the entity type of which at least one
 *                                     should exist in the alert.
 */
export const hasEntitiesOfTypes = (alert, entityTypes) =>
  alert?.entities?.some(entity =>
    // eslint-disable-next-line no-underscore-dangle
    entityTypes.includes(entity.__typename),
  );

/**
 * Sets the given entity to be the only entity on an alert.
 *
 * @param {*} alert the alert which can already contain entities which are removed.
 * @param {*} entity the entity that will be the only entity on the returned alert.
 */
export const setEntityForAlert = (alert, entity) => {
  return { ...alert, entities: [entity] };
};

/**
 * Checks if the alert is in effect at any point between the given leg start
 * and end times. Alerts that start during the leg count as well.
 */
const isAlertValidDuringLeg = (alert, legStartTime, legEndTime) =>
  isAlertValid(alert, legStartTime, { isFutureValid: true }) &&
  !(isNumber(legEndTime) && alert.effectiveStartDate > legEndTime);

/**
 * Narrows the entities of the alert to the given route/stop so that links built
 * from the first entity point to it. Falls back to all entities of the type
 * when none match, e.g. an alert that targets the parent station.
 */
const withEntitiesOf = (entityType, gtfsId) => alert => {
  // eslint-disable-next-line no-underscore-dangle
  const ofType = alert.entities?.filter(e => e.__typename === entityType);
  const matching = ofType?.filter(entity => entity.gtfsId === gtfsId);
  return { ...alert, entities: matching?.length ? matching : ofType };
};

/**
 * Returns an array of currently active alerts of the leg: alerts of its route
 * and origin/destination stops.
 *
 * @param {*} leg the itinerary leg to check.
 * @param {*} legStartTime the leg start unix time stamp (in seconds).
 */
export const getActiveLegAlerts = (leg, legStartTime) => {
  if (!leg) {
    return undefined;
  }

  const legEndTime = leg.end ? legTime(leg.end) / 1000 : undefined;

  return [
    ...getAlertsForObject(leg.route).map(
      withEntitiesOf(AlertEntityType.Route, leg.route?.gtfsId),
    ),
    ...getAlertsForObject(leg.from?.stop).map(
      withEntitiesOf(AlertEntityType.Stop, leg.from?.stop?.gtfsId),
    ),
    ...getAlertsForObject(leg.to?.stop).map(
      withEntitiesOf(AlertEntityType.Stop, leg.to?.stop?.gtfsId),
    ),
  ].filter(alert => isAlertValidDuringLeg(alert, legStartTime, legEndTime));
};

/**
 * Returns the highest severity level of the leg's active alerts. A canceled
 * leg is always a warning. Used for the alert badge of the leg in the
 * itinerary list.
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

  const startTime = legTime(leg.start) / 1000; // legTime is in ms
  return getMaximumAlertSeverityLevel(getActiveLegAlerts(leg, startTime));
};
