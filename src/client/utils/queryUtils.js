import isString from 'lodash/isString';
import { locationToOTP, getIntermediatePlaces } from '../../shared/utils/otpStrings';
import {
  getPathWithEndpointObjects,
  parseLocation,
  PREFIX_ITINERARY_SUMMARY,
} from '../../shared/utils/path';

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
  const { location } = match;

  const query = fixArrayParams({ ...location.query, ...newParams });

  router.replace({ ...location, query });
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
    (Array.isArray(newIntermediatePlaces) && newIntermediatePlaces.every(isString))
  ) {
    let parsedIntermediatePlaces;

    if (isString(newIntermediatePlaces)) {
      parsedIntermediatePlaces = hasUndefined(newIntermediatePlaces) ? '' : newIntermediatePlaces;
    } else {
      parsedIntermediatePlaces = newIntermediatePlaces.filter(
        intermediatePlace => !hasUndefined(intermediatePlace),
      );
    }

    replaceQueryParams(router, match, { intermediatePlaces: parsedIntermediatePlaces });
  }
};

export const updateItinerarySearch = (origin, destination, router, location) => {
  const newLocation = {
    ...location,
    state: { ...location.state, summaryPageSelected: 0 },
    pathname: getPathWithEndpointObjects(origin, destination, PREFIX_ITINERARY_SUMMARY),
  };
  router.replace(newLocation);
};

const isEmptyLocation = location => !location || Object.keys(location).length === 0;

/**
 * Handles a location chosen from the map popup. The other endpoint comes from the context, or
 * from the URL when the context is still empty, e.g. after a page reload.
 */
export const onLocationPopup = (
  item,
  id,
  router,
  match,
  origin,
  destination,
  locationActions,
  config,
) => {
  if (id === 'via') {
    const viaPoints = getIntermediatePlaces(match.location.query) || [];
    if (config.viaPointsMax && viaPoints.length >= config.viaPointsMax) {
      const lastViaPoint = viaPoints.pop();
      locationActions.deleteViaPoint(lastViaPoint);
    }
    viaPoints.push(item);
    locationActions.addViaPoint(item);
    setIntermediatePlaces(router, match, viaPoints.map(locationToOTP));
    return;
  }

  if (id === 'origin') {
    let otherEnd = destination;
    if (isEmptyLocation(destination)) {
      otherEnd = parseLocation(match.params?.to);
      locationActions.setDestination(otherEnd);
    }
    locationActions.setOrigin(item);
    updateItinerarySearch(item, otherEnd, router, match.location);
  } else {
    let otherEnd = origin;
    if (isEmptyLocation(origin)) {
      otherEnd = parseLocation(match.params?.from);
      locationActions.setOrigin(otherEnd);
    }
    locationActions.setDestination(item);
    updateItinerarySearch(otherEnd, item, router, match.location);
  }
};
