import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';
import trim from 'lodash/trim';

import { otpToLocation } from './otpStrings';

/**
 * Updates the browser's url with the given parameters.
 *
 * @param {*} router The router
 * @param {*} location The current location
 * @param {*} newParams The location query params to apply
 */
export const replaceQueryParams = (router, location, newParams) => {
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
 * query parameter, if available.
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
