import get from 'lodash/get';
import {
  otpToLocation,
  locationToOTP,
  addressToItinerarySearch,
} from './otpStrings';

export const TAB_NEARBY = 'lahellasi';
export const TAB_FAVOURITES = 'suosikit';
export const PREFIX_ROUTES = 'linjat';
export const PREFIX_STOPS = 'pysakit';
export const PREFIX_ITINERARY_SUMMARY = 'reitti';
export const stopUrl = id => id;

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
  tab: TAB_NEARBY,
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
  } else {
    parsed.ready = false;
  }
  console.log('returning:', parsed);

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

/**
  Figure out how to do routing

  Rules for replace/push:
  - if on front page and sets 2nd endpoint -> push
  - if on front page and 1st endpoint -> replace
  - if on itinerary summary page -> replace
  - on map/route page -> push
  */
export const navigateTo = ({
  origin,
  destination,
  context,
  router,
  base,
  tab = TAB_NEARBY,
}) => {
  console.log('c:', context);
  let push;
  switch (context) {
    case PREFIX_STOPS:
    case PREFIX_ROUTES:
      push = true;
      break;
    case PREFIX_ITINERARY_SUMMARY:
      push = false;
      break;
    default:
      if (origin.ready && destination.ready) {
        push = true;
      } else {
        push = false;
      }
      break;
  }

  const url = {
    ...base,
    pathname: getPathWithEndpointObjects(origin, destination, tab),
  };

  console.log(origin, destination);
  console.log('new url:', url, push);

  if (push) {
    router.push(url);
  } else {
    router.replace(url);
  }
};
