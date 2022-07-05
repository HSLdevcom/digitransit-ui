import startsWith from 'lodash/startsWith';
import distance from '@digitransit-search-util/digitransit-search-util-distance';
import { PlannerMessageType } from '../../../constants';

/**
 * @typedef {Object} QueryContext
 * @property {LocationState} locationState
 * @property {Array.<Array>} areaPolygon
 * @property {Number} minDistanceBetweenFromAndTo
 * @property {Number} currentTime
 * @property {String} error
 */

/**
 * @typedef {Object} Query
 * @property {Number} searchTime
 * @property {Object.<String, Number>} from
 * @property {Object.<String, Number>} to
 */

const INPUT_FIELD_FROM = 'FROM';
const INPUT_FIELD_TO = 'TO';

/**
 * Lookup
 *  TO   -> 1
 *  FROM -> 2
 *  BOTH -> 3
 * @param {Object} inputFields
 * @returns {Number}
 */
const getTargetField = inputFields => {
  return (
    (inputFields[INPUT_FIELD_TO] ? 1 : 0) +
    (inputFields[INPUT_FIELD_FROM] ? 2 : 0)
  );
};

const asArray = value => {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'undefined') {
    return [];
  }
  return [value];
};

/**
 * Find error message ids for routing error list.
 *
 * @param {Array.<Object>} routingErrors Router error list.
 * @returns {Array.<String>} Summary message ids
 */
const findRoutingErrors = routingErrors => {
  // build lookup object of errors to detect if concerns "from", "to" or "both"
  const errorLookup = routingErrors.reduce(
    (acc, { code, inputField }) => ({
      ...acc,
      [code]: { ...acc[code], [inputField]: true },
    }),
    {},
  );

  const msgIds = Object.entries(errorLookup).map(([code, inputFields]) => {
    const targetField = getTargetField(inputFields);

    switch (code) {
      case PlannerMessageType.NoTransitConnection:
        return 'no-transit-connection';
      case PlannerMessageType.NoTransitConnectionInSearchWindow:
        return 'no-transit-connection-in-search-window';
      case PlannerMessageType.WalkingBetterThanTransit:
        return 'walking-better-than-transit';
      case PlannerMessageType.OutsideServicePeriod:
        return 'outside-service-period';
      case PlannerMessageType.OutsideBounds:
        return `outside-bounds-${targetField}`;
      case PlannerMessageType.LocationNotFound:
        return `location-not-found-${targetField}`;
      case PlannerMessageType.NoStopsInRange:
        return `no-stops-in-range-${targetField}`;
      default:
        return 'system-error';
    }
  });

  return msgIds;
};

const isLocationEqual = (loc1, loc2) =>
  loc1.lat === loc2.lat && loc1.lon === loc2.lon;

/**
 * Find error message ids for user query and application state.
 *
 * @param {Query} query
 * @param {QueryContext} queryContext
 * @returns {Array.<String>} Error message ids
 */
const findQueryError = (query, queryContext) => {
  const {
    locationState,
    minDistanceBetweenFromAndTo = 0.0,
    error,
    currentTime,
    hasSettingsChanges,
  } = queryContext;

  // If error starts with "Error" it's not a message id, it's an error message
  // from OTP
  if (error && !startsWith(error, 'Error')) {
    return 'no-route-msg';
  }

  if (
    query.from &&
    query.to &&
    distance(query.from, query.to) < minDistanceBetweenFromAndTo
  ) {
    const hasLocation = locationState && locationState.hasLocation;
    const userNearOrigin =
      hasLocation &&
      distance(query.from, locationState) < minDistanceBetweenFromAndTo;
    const userNearDestination =
      hasLocation &&
      distance(query.to, locationState) < minDistanceBetweenFromAndTo;

    if (userNearOrigin || userNearDestination) {
      return 'no-route-already-at-destination';
    }
    if (isLocationEqual(query.from, query.to)) {
      return 'no-route-origin-same-as-destination';
    }
  } else if (query.walking || query.biking || query.driving) {
    const yesterday = currentTime - 24 * 60 * 60 * 1000;
    if (query.searchTime < yesterday) {
      return 'itinerary-in-the-past';
    }

    if (query.driving) {
      return 'walk-bike-itinerary-4';
    }

    if (query.walking && !query.biking) {
      return 'walk-bike-itinerary-1';
    }

    if (!query.walking && query.biking) {
      return 'walk-bike-itinerary-2';
    }
    return 'walk-bike-itinerary-3';
  } else if (hasSettingsChanges) {
    return 'no-route-msg-with-changes';
  }

  return undefined;
};

/**
 *
 * Find messageId by input data.
 *
 * @param {Array.<Object>} routingErrors
 * @param {Query} query
 * @param {QueryContext} queryContext
 *
 * @returns {string} Message ids
 */
const findErrorMessageIds = (
  routingErrors = [],
  query = {},
  queryContext = {},
) => {
  return [
    ...findRoutingErrors(routingErrors),
    ...asArray(findQueryError(query, queryContext)),
  ];
};

export default findErrorMessageIds;
