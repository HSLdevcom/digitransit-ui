import { otpToLocation, locationToOTP, addressToUrl } from './otpStrings';

export const getRoutePath = (origin, destination) =>
  ['/reitti', origin, destination].join('/');

export const getItineraryPath = (from, to, idx) =>
  [getRoutePath(from, to), idx].join('/');

export const isEmpty = s =>
  s === undefined || s === null || s.trim() === '' || s.trim() === '-';

export const getEndpointPath = (origin, destination) =>
  [
    '',
    isEmpty(origin) ? '-' : origin,
    isEmpty(destination) ? '-' : destination || '-',
  ].join('/');

/**
 * check is parameters are good for itinerary search
 * @deprecated
 */
export const isItinerarySearch = (origin, destination) =>
  !isEmpty(origin) && !isEmpty(destination);

export const isItinerarySearchObjects = (origin, destination) =>
  origin.ready !== false && destination.ready !== false;

/**
 * if both are set it's itinerary search...
 * @deprecated
 */
export const getPathWithEndpoints = (origin, destination) =>
  isItinerarySearch(origin, destination)
    ? getRoutePath(origin, destination)
    : getEndpointPath(origin, destination);

/**
 * use objects instead of strings If both are set it's itinerary search...
 */
export const getPathWithEndpointObjects = (origin, destination) =>
  isItinerarySearchObjects(origin, destination)
    ? getRoutePath(addressToUrl(origin), addressToUrl(destination))
    : getEndpointPath(locationToOTP(origin), locationToOTP(destination));

/**
 Parses current location from string to location object
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
  const parsed = otpToLocation(location);

  if (parsed.lat && parsed.lon) {
    parsed.set = true;
    parsed.ready = true;
  }
  return parsed;
};
