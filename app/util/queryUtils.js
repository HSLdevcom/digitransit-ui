import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';
import omit from 'lodash/omit';
import trim from 'lodash/trim';

import { otpToLocation } from './otpStrings';

/**
 * Removes selected itinerary index from url (pathname) and
 * state and then returns cleaned object.
 *
 * @param {*} location from the router
 * @returns cleaned location object
 */
export const resetSelectedItineraryIndex = loc => {
  const location = loc;
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
 * @param {string[]} paramsToClear The parameters to clear from the url
 */
export const clearQueryParams = (router, paramsToClear = []) => {
  if (paramsToClear.length === 0) {
    return;
  }
  let location = router.getCurrentLocation();

  location = resetSelectedItineraryIndex(location);

  const query = omit(location.query, paramsToClear);
  router.replace({
    ...location,
    query,
  });
};

/**
 * Updates the browser's url with the given parameters.
 *
 * @param {*} router The router
 * @param {*} newParams The location query params to apply
 */
export const replaceQueryParams = (router, newParams) => {
  let location = router.getCurrentLocation();

  location = resetSelectedItineraryIndex(location);

  router.replace({
    ...location,
    query: {
      ...location.query,
      ...newParams,
    },
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
  } else if (Array.isArray(intermediatePlaces)) {
    return intermediatePlaces.map(otpToLocation);
  } else if (isString(intermediatePlaces)) {
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
 * @param {String|String[]} newIntermediatePlaces A string or an array of intermediate locations
 */
export const setIntermediatePlaces = (router, newIntermediatePlaces) => {
  if (
    isString(newIntermediatePlaces) ||
    (Array.isArray(newIntermediatePlaces) &&
      newIntermediatePlaces.every(isString))
  ) {
    replaceQueryParams(router, { intermediatePlaces: newIntermediatePlaces });
  }
};

const getArrayValueOrDefault = (value, defaultValue = []) => {
  if (!value) {
    return defaultValue;
  }
  const decoded = decodeURI(value);
  return decoded ? decoded.split(',') : defaultValue;
};

const getRoutes = (query, preferred) => {
  if (!query) {
    return [];
  }
  return getArrayValueOrDefault(
    preferred ? query.preferredRoutes : query.unpreferredRoutes,
  );
};

const addRoute = (router, routeToAdd, preferred) => {
  const { query } = router.getCurrentLocation();
  const routes = getRoutes(query, preferred);
  if (routes.includes(routeToAdd)) {
    return;
  }

  routes.push(routeToAdd);
  replaceQueryParams(router, {
    [`${preferred ? 'preferred' : 'unpreferred'}Routes`]: routes.join(','),
  });
};

const removeRoute = (router, routeToRemove, preferred) => {
  const { query } = router.getCurrentLocation();
  const routes = getRoutes(query, preferred);
  if (!routes.includes(routeToRemove)) {
    return;
  }

  replaceQueryParams(router, {
    [`${preferred ? 'preferred' : 'unpreferred'}Routes`]: routes.filter(
      r => r !== routeToRemove,
    ),
  });
};

/**
 * Adds the given route as a preferred option in the routing request.
 *
 * @param {*} router The router
 * @param {*} routeToAdd The route identifier to add
 */
export const addPreferredRoute = (router, routeToAdd) =>
  addRoute(router, routeToAdd, true);

/**
 * Removes the given route from the preferred options in the routing request.
 *
 * @param {*} router The router
 * @param {*} routeToRemove The route identifier to remove
 */
export const removePreferredRoute = (router, routeToRemove) =>
  removeRoute(router, routeToRemove, true);

/**
 * Adds the given route as an unpreferred option in the routing request.
 *
 * @param {*} router The router
 * @param {*} routeToAdd The route identifier to add
 */
export const addUnpreferredRoute = (router, routeToAdd) =>
  addRoute(router, routeToAdd, false);

/**
 * Removes the given route from the unpreferred options in the routing request.
 *
 * @param {*} router The router
 * @param {*} routeToRemove The route identifier to remove
 */
export const removeUnpreferredRoute = (router, routeToRemove) =>
  removeRoute(router, routeToRemove, false);

/**
 * Retrieves all the user-customizable settings from the url.
 *
 * @param {*} query The query part of the current url
 */
export const getQuerySettings = query => {
  if (!query) {
    return {};
  }

  const keys = Object.keys(query);
  const hasKey = key => keys.includes(key);
  const getNumberValueOrDefault = (value, defaultValue = undefined) =>
    value !== undefined && value !== null && value !== ''
      ? Number(value)
      : defaultValue;

  return {
    ...(hasKey('accessibilityOption') && {
      accessibilityOption: getNumberValueOrDefault(query.accessibilityOption),
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
  };
};
