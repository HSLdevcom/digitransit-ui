import get from 'lodash/get';
import {
  otpToLocation,
  locationToOTP,
  addressToItinerarySearch,
} from './otpStrings';

export const TAB_NEARBY = 'lahellasi';
export const TAB_FAVOURITES = 'suosikit';
export const PREFIX_ROUTES = 'linjat';
export const PREFIX_NEARYOU = TAB_NEARBY;
export const PREFIX_STOPS = 'pysakit';
export const PREFIX_BIKESTATIONS = 'pyoraasemat';
export const PREFIX_TERMINALS = 'terminaalit';
export const PREFIX_ITINERARY_SUMMARY = 'reitti';
export const PREFIX_DISRUPTION = 'hairiot';
export const PREFIX_TIMETABLE = 'aikataulu';
export const stopUrl = id => id;
export const LOCAL_STORAGE_EMITTER_PATH = '/local-storage-emitter';

export const createReturnPath = (path, origin, destination) => {
  const returnUrl = path === '' ? '' : `/${path}`;
  return [
    returnUrl,
    encodeURIComponent(decodeURIComponent(origin)),
    encodeURIComponent(decodeURIComponent(destination)),
  ].join('/');
};

export const getNearYouPath = (place, mode) =>
  [
    `/${PREFIX_NEARYOU}`,
    encodeURIComponent(decodeURIComponent(mode)),
    encodeURIComponent(decodeURIComponent(place)),
  ].join('/');

export const getSummaryPath = (origin, destination) =>
  [
    `/${PREFIX_ITINERARY_SUMMARY}`,
    encodeURIComponent(decodeURIComponent(origin)),
    encodeURIComponent(decodeURIComponent(destination)),
  ].join('/');

export const getItineraryPath = (from, to, idx) =>
  [getSummaryPath(from, to), idx].join('/');

export const isEmpty = s =>
  s === undefined || s === null || s.trim() === '' || s.trim() === '-';

export const getEndpointPath = (origin, destination, indexPath) => {
  if (isEmpty(origin) && isEmpty(destination)) {
    return indexPath === '' ? '/' : `/${indexPath}/`;
  }
  if (indexPath === '') {
    return [
      indexPath,
      encodeURIComponent(isEmpty(origin) ? '-' : origin),
      encodeURIComponent(isEmpty(destination) ? '-' : destination),
    ].join('/');
  }
  return [
    '',
    indexPath,
    encodeURIComponent(isEmpty(origin) ? '-' : origin),
    encodeURIComponent(isEmpty(destination) ? '-' : destination),
  ].join('/');
};

export const getStopRoutePath = searchObj => {
  if (searchObj.properties && searchObj.properties.link) {
    return searchObj.properties.link;
  }
  let id = searchObj.properties.id
    ? searchObj.properties.id
    : searchObj.properties.gtfsId;
  let path;
  switch (searchObj.properties.layer) {
    case 'station':
    case 'favouriteStation':
      path = `/${PREFIX_TERMINALS}/`;
      id = id.replace('GTFS:', '').replace(':', '%3A');
      break;
    case 'bikeRentalStation':
    case 'favouriteBikeRentalStation':
      path = `/${PREFIX_BIKESTATIONS}/`;
      id = searchObj.properties.labelId;
      break;
    default:
      path = `/${PREFIX_STOPS}/`;
      id = id.replace('GTFS:', '').replace(':', '%3A');
  }
  return path.concat(id);
};

/**
 * check is parameters are good for itinerary search
 * @deprecated
 */
export const isItinerarySearch = (origin, destination) => {
  const isSearch = !isEmpty(origin) && !isEmpty(destination);
  return isSearch;
};

export const isItinerarySearchObjects = (origin, destination) => {
  return get(origin, 'address') && get(destination, 'address');
};

/**
 * use objects instead of strings If both are set it's itinerary search...
 */
export const getPathWithEndpointObjects = (origin, destination, rootPath) => {
  const r =
    rootPath === PREFIX_ITINERARY_SUMMARY ||
    isItinerarySearchObjects(origin, destination)
      ? getSummaryPath(
          addressToItinerarySearch(origin),
          addressToItinerarySearch(destination),
        )
      : getEndpointPath(
          locationToOTP(origin),
          locationToOTP(destination),
          rootPath,
        );

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

  return parsed;
};

export const getHomeUrl = (origin, indexPath) => {
  // TODO consider looking at destination too
  const homeUrl = getPathWithEndpointObjects(
    origin,
    {
      set: false,
      ready: false,
    },
    indexPath,
  );

  return homeUrl;
};
