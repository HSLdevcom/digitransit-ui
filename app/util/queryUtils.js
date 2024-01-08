import isString from 'lodash/isString';
import cloneDeep from 'lodash/cloneDeep';
import {
  locationToOTP,
  otpToLocation,
  getIntermediatePlaces,
} from './otpStrings';
import { getPathWithEndpointObjects, PREFIX_ITINERARY_SUMMARY } from './path';
import { saveFutureRoute } from '../action/FutureRoutesActions';
import { addViaPoint } from '../action/ViaPointActions';

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
export const replaceQueryParams = (router, match, newParams) => {
  let { location } = match;
  location = resetSelectedItineraryIndex(location);

  const query = fixArrayParams({
    ...location.query,
    ...newParams,
  });

  router.replace({
    ...location,
    query,
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
  const hasUndefined = string => string.includes('undefined');

  if (
    isString(newIntermediatePlaces) ||
    (Array.isArray(newIntermediatePlaces) &&
      newIntermediatePlaces.every(isString))
  ) {
    let parsedIntermediatePlaces;

    if (isString(newIntermediatePlaces)) {
      parsedIntermediatePlaces = hasUndefined(newIntermediatePlaces)
        ? ''
        : newIntermediatePlaces;
    } else {
      parsedIntermediatePlaces = newIntermediatePlaces.filter(
        intermediatePlace => !hasUndefined(intermediatePlace),
      );
    }

    replaceQueryParams(router, match, {
      intermediatePlaces: parsedIntermediatePlaces,
    });
  }
};

export const updateItinerarySearch = (
  origin,
  destination,
  router,
  location,
  executeAction,
) => {
  executeAction(saveFutureRoute, {
    origin,
    destination,
    query: location.query,
  });

  const newLocation = {
    ...location,
    state: {
      ...location.state,
      summaryPageSelected: 0,
    },
    pathname: getPathWithEndpointObjects(
      origin,
      destination,
      PREFIX_ITINERARY_SUMMARY,
    ),
  };
  router.replace(newLocation);
};

export const onLocationPopup = (item, id, router, match, executeAction) => {
  if (id === 'via') {
    const viaPoints = getIntermediatePlaces(match.location.query)
      .concat([item])
      .map(locationToOTP);
    executeAction(addViaPoint, item);
    setIntermediatePlaces(router, match, viaPoints);
    return;
  }
  let origin = otpToLocation(match.params.from);
  let destination = otpToLocation(match.params.to);
  if (id === 'origin') {
    origin = item;
  } else {
    destination = item;
  }
  updateItinerarySearch(
    origin,
    destination,
    router,
    match.location,
    executeAction,
  );
};
