import { isEmpty, isEqual } from 'lodash';
import isString from 'lodash/isString';
import omit from 'lodash/omit';
import trim from 'lodash/trim';
import cloneDeep from 'lodash/cloneDeep';
import { config } from 'react-transition-group';

import { otpToLocation } from './otpStrings';
import { OptimizeType } from '../constants';
import {
  getCustomizedSettings,
  setCustomizedSettings,
  resetCustomizedSettings,
} from '../store/localStorage';
import { addAnalyticsEvent } from './analyticsUtils';
import { getCurrentSettings, getDefaultSettings } from './planParamUtil';

export const setSettingsData = (router, match) => {
  // eslint-disable-next-line no-use-before-define
  const customizedSettings = getCustomizedSettings();
  const currentSettings = getCurrentSettings(config, match.location.query);
  const defaultSettings = getDefaultSettings(config);

  if (
    isEmpty(customizedSettings) ||
    isEqual(currentSettings, defaultSettings)
  ) {
    resetCustomizedSettings();
    // eslint-disable-next-line no-use-before-define
    clearQueryParams(router, match, Object.keys(defaultSettings));
  } else {
    setCustomizedSettings(customizedSettings);
  }
};

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
 * Clears the given parameters from the browser's url.
 *
 * @param {*} router The router
 * @param {*} match The match object from found
 * @param {string[]} paramsToClear The parameters to clear from the url
 */
export const clearQueryParams = (router, match, paramsToClear = []) => {
  if (paramsToClear.length === 0) {
    return;
  }
  let { location } = match;

  location = resetSelectedItineraryIndex(location);

  const query = omit(location.query, paramsToClear);
  router.replace({
    ...location,
    query,
  });
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
export const replaceQueryParams = (router, match, newParams) => {
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

  router.replace({
    ...location,
    query: removeTriangleFactors ? omit(query, triangleFactors) : query,
  });
};

/**
 * Extracts the location information from the intermediatePlaces
 * query parameter, if available. The locations will be returned in
 * non-OTP mode (i.e. mapped to lat?, lon? and address).
 *
 * @typedef Query
 * @prop {String|String[]} intermediatePlaces
 *
 * @param {Query} query The query to extract the information from.
 * @returns an array of locations if available, or an empty array otherwise
 */
export const getIntermediatePlaces = query => {
  if (!query) {
    return [];
  }
  const { intermediatePlaces } = query;
  if (!intermediatePlaces) {
    return [];
  }
  if (Array.isArray(intermediatePlaces)) {
    return intermediatePlaces.map(otpToLocation);
  }
  if (isString(intermediatePlaces)) {
    if (isEmpty(trim(intermediatePlaces))) {
      return [];
    }
    return [otpToLocation(intermediatePlaces)];
  }
  return [];
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

const getArrayValueOrDefault = (value, defaultValue = []) => {
  if (!value) {
    return defaultValue;
  }
  const decoded = decodeURI(value);
  return decoded ? decoded.split(',') : defaultValue;
};

/**
 * Retrieves all the user-customizable settings from the url.
 *
 * @param {*} query The query part of the current url
 */
export const getQuerySettings = query => {
  if (!query) {
    return {};
  }

  const hasKey = key => Object.hasOwnProperty.call(query, key);
  const getNumberValueOrDefault = (value, defaultValue = undefined) =>
    value !== undefined && value !== null && value !== ''
      ? Number(value)
      : defaultValue;

  return {
    ...(hasKey('usingWheelchair') && {
      usingWheelchair: getNumberValueOrDefault(query.usingWheelchair),
    }),
    ...(hasKey('bikeSpeed') && {
      bikeSpeed: getNumberValueOrDefault(query.bikeSpeed),
    }),
    ...(hasKey('minTransferTime') && {
      minTransferTime: getNumberValueOrDefault(query.minTransferTime),
    }),
    ...(hasKey('modes') && {
      modes: getArrayValueOrDefault(query.modes),
    }),
    ...(hasKey('optimize') && {
      optimize: query.optimize,
    }),
    ...(query.optimize === OptimizeType.Triangle && {
      ...(hasKey('safetyFactor') && {
        safetyFactor: getNumberValueOrDefault(query.safetyFactor),
      }),
      ...(hasKey('slopeFactor') && {
        slopeFactor: getNumberValueOrDefault(query.slopeFactor),
      }),
      ...(hasKey('timeFactor') && {
        timeFactor: getNumberValueOrDefault(query.timeFactor),
      }),
    }),
    ...(hasKey('preferredRoutes') && {
      preferredRoutes: getArrayValueOrDefault(query.preferredRoutes),
    }),
    ...(hasKey('ticketTypes') && {
      ticketTypes: query.ticketTypes,
    }),
    ...(hasKey('transferPenalty') && {
      transferPenalty: getNumberValueOrDefault(query.transferPenalty),
    }),
    ...(hasKey('unpreferredRoutes') && {
      unpreferredRoutes: getArrayValueOrDefault(query.unpreferredRoutes),
    }),
    ...(hasKey('walkBoardCost') && {
      walkBoardCost: getNumberValueOrDefault(query.walkBoardCost),
    }),
    ...(hasKey('walkReluctance') && {
      walkReluctance: getNumberValueOrDefault(query.walkReluctance),
    }),
    ...(hasKey('walkSpeed') && {
      walkSpeed: getNumberValueOrDefault(query.walkSpeed),
    }),
    ...(hasKey('allowedBikeRentalNetworks') && {
      allowedBikeRentalNetworks: getArrayValueOrDefault(
        query.allowedBikeRentalNetworks,
      ),
    }),
  };
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
