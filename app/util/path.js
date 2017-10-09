import { otpToLocation } from './otpStrings';

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

export const isItinerarySearch = (origin, destination) =>
  !isEmpty(origin) && !isEmpty(destination);

/**
 * if both are set it's itinerary search...
 */
export const getPathWithEndpoints = (origin, destination) =>
  isItinerarySearch(origin, destination)
    ? getRoutePath(origin, destination)
    : getEndpointPath(origin, destination);

/**
 Parses current location from string to location object
*/
export const parseLocation = location => {
  if (isEmpty(location)) {
    return { set: false };
  }
  if (location === 'POS') {
    return {
      set: true,
      gps: true,
    };
  }
  const parsed = otpToLocation(location);

  if (parsed.lat && parsed.lon) {
    parsed.set = true;
  }
  return parsed;
};
