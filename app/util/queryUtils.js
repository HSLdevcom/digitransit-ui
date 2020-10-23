import isString from 'lodash/isString';
import omit from 'lodash/omit';
import cloneDeep from 'lodash/cloneDeep';
import { graphql } from 'react-relay';

import { parseLatLon } from './otpStrings';
import { OptimizeType } from '../constants';
import { addAnalyticsEvent } from './analyticsUtils';
import { PREFIX_ITINERARY_SUMMARY } from './path';
import { saveFutureRoute } from '../action/FutureRoutesActions';

/**
 * Removes selected itinerary index from url (pathname) and
 * state and then returns a cleaned object.
 *
 * @param {*} location from the router
 * @returns cleaned location object
 */
export const resetSelectedItineraryIndex = loc => {
  const location = cloneDeep(loc);
  if (location.state && location.state.summaryPageSelected) {
    location.state.summaryPageSelected = 0;
  }

  if (location.pathname) {
    const pathArray = location.pathname.split('/');
    if (pathArray.length === 5) {
      pathArray.pop();
      location.pathname = pathArray.join('/');
    }
  }

  return location;
};

/**
 * Processes query so that empty arrays will be preserved in URL
 *
 * @param {*} query The location query params to fix
 */

export const fixArrayParams = query => {
  const fixedQuery = { ...query };

  Object.keys(query).forEach(key => {
    if (Array.isArray(query[key]) && !query[key].length) {
      fixedQuery[key] = '';
    }
  });
  return fixedQuery;
};

/**
 * Updates the browser's url with the given parameters.
 *
 * @param {*} router The router
 * @param {*} match The match object from found
 * @param {*} newParams The location query params to apply
 */
export const replaceQueryParams = (router, match, newParams, executeAction) => {
  let { location } = match;
  location = resetSelectedItineraryIndex(location);

  const removeTriangleFactors =
    newParams.optimize &&
    location.query.optimize &&
    newParams.optimize !== location.query.optimize &&
    location.query.optimize === OptimizeType.Triangle;
  const triangleFactors = ['safetyFactor', 'slopeFactor', 'timeFactor'];

  const query = fixArrayParams({
    ...location.query,
    ...newParams,
  });

  if (
    query &&
    query.time &&
    location &&
    location.pathname.indexOf(PREFIX_ITINERARY_SUMMARY) === 1 &&
    executeAction
  ) {
    const pathArray = decodeURIComponent(location.pathname)
      .substring(1)
      .split('/');
    pathArray.shift();
    const originArray = pathArray[0].split('::');
    const destinationArray = pathArray[1].split('::');
    const newRoute = {
      origin: {
        address: originArray[0],
        coordinates: parseLatLon(originArray[1]),
      },
      destination: {
        address: destinationArray[0],
        coordinates: parseLatLon(destinationArray[1]),
      },
      arriveBy: query.arriveBy ? query.arriveBy : false,
      time: query.time,
    };
    executeAction(saveFutureRoute, newRoute);
  }

  router.replace({
    ...location,
    query: removeTriangleFactors ? omit(query, triangleFactors) : query,
  });
};

/**
 * Updates the intermediatePlaces query parameter with the given values.
 *
 * @param {*} router The router
 * @param {*} match The match object from found
 * @param {String|String[]} newIntermediatePlaces A string or an array of intermediate locations
 */
export const setIntermediatePlaces = (router, match, newIntermediatePlaces) => {
  if (
    isString(newIntermediatePlaces) ||
    (Array.isArray(newIntermediatePlaces) &&
      newIntermediatePlaces.every(isString))
  ) {
    replaceQueryParams(router, match, {
      intermediatePlaces: newIntermediatePlaces,
    });
  }
};

/**
 * The triangle factor value to use when both the "prefer greenways" and
 * the "avoid elevation changes" flags are enabled.
 */
export const TWO_FACTORS_ENABLED = 0.45;

/**
 * The triangle factor value to use when only one of the "prefer greenways" and
 * the "avoid elevation changes" flags is enabled.
 */
export const ONE_FACTOR_ENABLED = 0.8;

/**
 * The triangle factor value to use when a triangle factor has no emphasis.
 */
export const FACTOR_DISABLED = 0.1;

/**
 * Checks if the given settings have "prefer greenways" enabled.
 *
 * @param {string} optimize the current OptimizeType
 * @param {{safetyFactor: number}} safetyFactor the current safetyFactor value
 */
export const getPreferGreenways = (optimize, { safetyFactor } = {}) =>
  optimize === OptimizeType.Greenways ||
  (optimize === OptimizeType.Triangle && safetyFactor >= TWO_FACTORS_ENABLED);

/**
 * Checks if the given settings have "avoid elevations changes" enabled.
 *
 * @param {string} optimize the current OptimizeType
 * @param {{slopeFactor: number}} slopeFactor the current slopeFactor value
 */
export const getAvoidElevationChanges = (optimize, { slopeFactor } = {}) =>
  optimize === OptimizeType.Triangle && slopeFactor >= TWO_FACTORS_ENABLED;

/**
 * Fuzzily sets the "prefer greenways" flag on.
 *
 * @param {*} router the router
 * @param {*} match The match object from found
 * @param {string} optimize the current OptimizeType
 * @param {*} triangleFactors the current triangleFactors
 * @param {boolean} forceSingle whether the fuzzy logic should be overridden
 */
export const setPreferGreenways = (
  router,
  match,
  optimize,
  triangleFactors = {},
  forceSingle = false,
) => {
  if (!forceSingle && getPreferGreenways(optimize, triangleFactors)) {
    return;
  }
  if (!forceSingle && getAvoidElevationChanges(optimize, triangleFactors)) {
    replaceQueryParams(router, match, {
      optimize: OptimizeType.Triangle,
      safetyFactor: TWO_FACTORS_ENABLED,
      slopeFactor: TWO_FACTORS_ENABLED,
      timeFactor: FACTOR_DISABLED,
    });
  } else {
    replaceQueryParams(router, match, { optimize: OptimizeType.Greenways });
  }
  addAnalyticsEvent({
    action: 'EnablePreferCycleways',
    category: 'ItinerarySettings',
    name: null,
  });
};

/**
 * Fuzzily sets the "avoid elevation changes" flag on.
 *
 * @param {*} router the router
 * @param {*} match The match object from found
 * @param {string} optimize the current OptimizeType
 * @param {*} triangleFactors the current triangleFactors
 * @param {boolean} forceSingle whether the fuzzy logic should be overridden
 */
export const setAvoidElevationChanges = (
  router,
  match,
  optimize,
  triangleFactors = {},
  forceSingle = false,
) => {
  if (!forceSingle && getAvoidElevationChanges(optimize, triangleFactors)) {
    return;
  }
  const bothEnabled =
    !forceSingle && getPreferGreenways(optimize, triangleFactors);
  replaceQueryParams(router, match, {
    optimize: OptimizeType.Triangle,
    safetyFactor: bothEnabled ? TWO_FACTORS_ENABLED : FACTOR_DISABLED,
    slopeFactor: bothEnabled ? TWO_FACTORS_ENABLED : ONE_FACTOR_ENABLED,
    timeFactor: FACTOR_DISABLED,
  });
  addAnalyticsEvent({
    action: 'EnableAvoidChangesInElevation',
    category: 'ItinerarySettings',
    name: null,
  });
};

/**
 * Fuzzily resets the "prefer greenways" flag.
 *
 * @param {*} router the router
 * @param {*} match The match object from found
 * @param {string} optimize the current OptimizeType
 * @param {*} triangleFactors the current triangleFactors
 * @param {*} defaultOptimize the default OptimizeType
 */
export const resetPreferGreenways = (
  router,
  match,
  optimize,
  triangleFactors,
  defaultOptimize,
) => {
  if (!getPreferGreenways(optimize, triangleFactors)) {
    return;
  }
  if (getAvoidElevationChanges(optimize, triangleFactors)) {
    setAvoidElevationChanges(router, match, optimize, triangleFactors, true);
  } else {
    replaceQueryParams(router, match, {
      optimize: defaultOptimize,
    });
  }
  addAnalyticsEvent({
    action: 'DisablePreferCycleways',
    category: 'ItinerarySettings',
    name: null,
  });
};

/**
 * Fuzzily resets the "avoid elevation changes" flag.
 *
 * @param {*} router the router
 * @param {*} match The match object from found
 * @param {string} optimize the current OptimizeType
 * @param {*} triangleFactors the current triangleFactors
 * @param {*} defaultOptimize the default OptimizeType
 */
export const resetAvoidElevationChanges = (
  router,
  match,
  optimize,
  triangleFactors,
  defaultOptimize,
) => {
  if (!getAvoidElevationChanges(optimize, triangleFactors)) {
    return;
  }
  if (getPreferGreenways(optimize, triangleFactors)) {
    setPreferGreenways(router, match, optimize, triangleFactors, true);
  } else {
    replaceQueryParams(router, match, {
      optimize: defaultOptimize,
    });
  }
  addAnalyticsEvent({
    action: 'DisableAvoidChangesInElevation',
    category: 'ItinerarySettings',
    name: null,
  });
};

/**
 * Generic plan query.
 */
export const planQuery = graphql`
  query queryUtils_SummaryPage_Query(
    $fromPlace: String!
    $toPlace: String!
    $intermediatePlaces: [InputCoordinates!]
    $numItineraries: Int!
    $modes: [TransportMode!]
    $date: String!
    $time: String!
    $walkReluctance: Float
    $walkBoardCost: Int
    $minTransferTime: Int
    $walkSpeed: Float
    $maxWalkDistance: Float
    $wheelchair: Boolean
    $ticketTypes: [String]
    $disableRemainingWeightHeuristic: Boolean
    $arriveBy: Boolean
    $transferPenalty: Int
    $ignoreRealtimeUpdates: Boolean
    $maxPreTransitTime: Int
    $walkOnStreetReluctance: Float
    $waitReluctance: Float
    $bikeSpeed: Float
    $bikeSwitchTime: Int
    $bikeSwitchCost: Int
    $optimize: OptimizeType
    $triangle: InputTriangle
    $maxTransfers: Int
    $waitAtBeginningFactor: Float
    $heuristicStepsPerMainStep: Int
    $compactLegsByReversedSearch: Boolean
    $itineraryFiltering: Float
    $modeWeight: InputModeWeight
    $preferred: InputPreferred
    $unpreferred: InputUnpreferred
    $allowedBikeRentalNetworks: [String]
    $locale: String
  ) {
    viewer {
      ...SummaryPage_viewer
      @arguments(
        fromPlace: $fromPlace
        toPlace: $toPlace
        intermediatePlaces: $intermediatePlaces
        numItineraries: $numItineraries
        modes: $modes
        date: $date
        time: $time
        walkReluctance: $walkReluctance
        walkBoardCost: $walkBoardCost
        minTransferTime: $minTransferTime
        walkSpeed: $walkSpeed
        maxWalkDistance: $maxWalkDistance
        wheelchair: $wheelchair
        ticketTypes: $ticketTypes
        disableRemainingWeightHeuristic: $disableRemainingWeightHeuristic
        arriveBy: $arriveBy
        transferPenalty: $transferPenalty
        ignoreRealtimeUpdates: $ignoreRealtimeUpdates
        maxPreTransitTime: $maxPreTransitTime
        walkOnStreetReluctance: $walkOnStreetReluctance
        waitReluctance: $waitReluctance
        bikeSpeed: $bikeSpeed
        bikeSwitchTime: $bikeSwitchTime
        bikeSwitchCost: $bikeSwitchCost
        optimize: $optimize
        triangle: $triangle
        maxTransfers: $maxTransfers
        waitAtBeginningFactor: $waitAtBeginningFactor
        heuristicStepsPerMainStep: $heuristicStepsPerMainStep
        compactLegsByReversedSearch: $compactLegsByReversedSearch
        itineraryFiltering: $itineraryFiltering
        modeWeight: $modeWeight
        preferred: $preferred
        unpreferred: $unpreferred
        allowedBikeRentalNetworks: $allowedBikeRentalNetworks
        locale: $locale
      )
    }

    serviceTimeRange {
      ...SummaryPage_serviceTimeRange
    }
  }
`;
