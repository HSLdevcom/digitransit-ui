import get from 'lodash/get';
import {
  otpToLocation,
  locationToOTP,
  addressToItinerarySearch,
} from './otpStrings';

export const getRoutePath = (origin, destination) =>
  ['/reitti', origin, destination].join('/');

export const getItineraryPath = (from, to, idx) =>
  [getRoutePath(from, to), idx].join('/');

export const isEmpty = s =>
  s === undefined || s === null || s.trim() === '' || s.trim() === '-';

export const getEndpointPath = (origin, destination, tab) =>
  [
    '',
    encodeURIComponent(isEmpty(origin) ? '-' : origin),
    encodeURIComponent(isEmpty(destination) ? '-' : destination || '-'),
    tab,
  ].join('/');

/**
 * check is parameters are good for itinerary search
 * @deprecated
 */
export const isItinerarySearch = (origin, destination) => {
  const isSearch = !isEmpty(origin) && !isEmpty(destination);
  return isSearch;
};

export const isItinerarySearchObjects = (origin, destination) => {
  const isSearch =
    get(origin, 'ready') === true && get(destination, 'ready') === true;
  return isSearch;
};

/**
 * if both are set it's itinerary search...
 * @deprecated
 */
export const getPathWithEndpoints = (origin, destination, tab) =>
  isItinerarySearch(origin, destination)
    ? getRoutePath(origin, destination)
    : getEndpointPath(origin, destination, tab);

/**
 * use objects instead of strings If both are set it's itinerary search...
 */
export const getPathWithEndpointObjects = (
  origin,
  destination,
  tab: 'lahellasi',
) => {
  const r = isItinerarySearchObjects(origin, destination)
    ? getRoutePath(
        addressToItinerarySearch(origin),
        addressToItinerarySearch(destination),
      )
    : getEndpointPath(locationToOTP(origin), locationToOTP(destination), tab);

  return r;
};

/**
 * Parses current location from string to location object
 *
*/
export const parseLocation = location => {
  if (isEmpty(location)) {
    return { set: false, ready: false };
  }
  if (location === 'POS') {
    return {
      set: true,
      ready: false, // state ready=true will only be set when we have the actual position too
      gps: true,
    };
  }
  const parsed = otpToLocation(decodeURIComponent(location));

  if (parsed.lat && parsed.lon) {
    parsed.set = true;
    parsed.ready = true;
  }
  return parsed;
};

export const getHomeUrl = origin => {
  // TODO consider looking at destination too
  const homeUrl = getPathWithEndpointObjects(origin, {
    set: false,
    ready: false,
  });

  return homeUrl;
};
