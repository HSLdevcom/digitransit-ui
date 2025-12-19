import get from 'lodash/get';
import trimEnd from 'lodash/trimEnd';
import trimStart from 'lodash/trimStart';
import toPairs from 'lodash/toPairs';
import { otpToLocation, locationToOTP, locationToUri } from './otpStrings';

export const TAB_NEARBY = 'lahellasi';
export const TAB_FAVOURITES = 'suosikit';
export const PREFIX_ROUTES = 'linjat';
export const PREFIX_NEARYOU = TAB_NEARBY;
export const PREFIX_STOPS = 'pysakit';
export const PREFIX_BIKESTATIONS = 'pyoraasemat';
export const PREFIX_BIKEPARK = 'pyoraparkit';
export const PREFIX_CARPARK = 'autoparkit';
export const PREFIX_TERMINALS = 'terminaalit';
export const PREFIX_ITINERARY_SUMMARY = 'reitti';
export const PREFIX_DISRUPTION = 'hairiot';
export const PREFIX_TIMETABLE = 'aikataulu';
export const stopUrl = id => id;
export const EMBEDDED_SEARCH_PATH = '/haku';
export const PREFIX_RENTALVEHICLES = 'skuutit';
export const TRAFFICNOW = 'liikenne';

/**
 * Join argument with slash separator.
 *
 * @param  {Array.<string>} segments Path segments.
 * @returns {string}
 *
 * @example
 * pathJoin("my/", "path") // my/path
 */
export const pathJoin = segments =>
  segments
    .reduce((acc, segment, i, arr) => {
      let output = String(segment);
      output = i > 0 ? trimStart(output, '/') : output;
      output = i < arr.length - 1 ? trimEnd(output, '/') : output;
      return acc.concat(output);
    }, [])
    .join('/');

/**
 * @param {Object.<string, string>} params
 * @returns {string}
 */
export const buildQueryString = params => {
  return toPairs(params)
    .map(keyVal => keyVal.join('='))
    .join('&');
};

export const buildURL = (pathSegments = []) => {
  const urlOrigin =
    typeof window !== 'undefined'
      ? window.location.origin // eslint-disable-line compat/compat
      : 'url://builder/';

  // build valid url
  const url = new URL(urlOrigin); // eslint-disable-line compat/compat
  url.pathname = pathJoin(pathSegments);
  return url;
};

export const createReturnPath = (
  path,
  origin,
  destination,
  hash = undefined,
) => {
  const returnUrl = path === '' ? '' : `/${path}`;
  return [
    returnUrl,
    encodeURIComponent(decodeURIComponent(origin)),
    encodeURIComponent(decodeURIComponent(destination)),
    hash || '',
  ].join('/');
};

export const getNearYouPath = (place, mode) =>
  [
    `/${PREFIX_NEARYOU}`,
    encodeURIComponent(decodeURIComponent(mode)),
    encodeURIComponent(decodeURIComponent(place)),
  ].join('/');

export const getItineraryPagePath = (origin, destination) =>
  [
    `/${PREFIX_ITINERARY_SUMMARY}`,
    encodeURIComponent(decodeURIComponent(origin)),
    encodeURIComponent(decodeURIComponent(destination)),
  ].join('/');

export const isEmpty = s =>
  s === undefined || s === null || s.trim() === '' || s.trim() === '-';

export const coordsDiff = (c1, c2) =>
  Number.isNaN(c1) !== Number.isNaN(c2) ||
  (!Number.isNaN(c1) && Math.abs(c1 - c2) > 0.0001);

export const sameLocations = (l1, l2) => {
  return (
    (l1.type === 'CurrentLocation' && l2.type === 'CurrentLocation') ||
    (l1.address === l2.address &&
      !coordsDiff(l1.lat, l2.lat) &&
      !coordsDiff(l1.lon, l2.lon))
  );
};

export const getIndexPath = (origin, destination, indexPath) => {
  if (isEmpty(origin) && isEmpty(destination)) {
    return indexPath === '' ? '/' : `/${indexPath}`;
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
  if (searchObj.properties.link) {
    return searchObj.properties.link;
  }
  let id = searchObj.properties.id || searchObj.properties.gtfsId;
  let path;
  switch (searchObj.properties.layer) {
    case 'station':
    case 'favouriteStation':
      path = PREFIX_TERMINALS;
      id = id.replace('GTFS:', '');
      break;
    case 'bikestation': {
      const network = searchObj.properties.source?.split('citybikes')[1];
      path = PREFIX_BIKESTATIONS;
      id = `${network}:${searchObj.properties.id}`;
      break;
    }
    case 'favouriteVehicleRentalStation':
      path = PREFIX_BIKESTATIONS;
      id = searchObj.properties.labelId;
      break;
    case 'carpark':
      path = PREFIX_CARPARK;
      break;
    case 'bikepark':
      path = PREFIX_BIKEPARK;
      break;
    default:
      path = PREFIX_STOPS;
      // stop id from geocoding has GTFS prefix and possibly stopCode postfix. Strip them away
      [id] = id.replace('GTFS:', '').split('#');
  }
  return `/${path}/${encodeURIComponent(id)}`;
};

export function routePagePath(routeId, tab, patternId, tripId, queryParams) {
  let path = `/${PREFIX_ROUTES}/${encodeURIComponent(routeId)}`;

  if (tab) {
    path = `${path}/${tab}`;
  }
  if (patternId) {
    path = `${path}/${encodeURIComponent(patternId)}`;
  }
  if (tripId) {
    path = `${path}/${encodeURIComponent(tripId)}`;
  }
  if (queryParams) {
    path = `${path}${queryParams}`; // note: '?' is not added
  }
  return path;
}

export function stopPagePath(isStation, gtfsId, tab, search) {
  let path = isStation
    ? `/${PREFIX_TERMINALS}/${encodeURIComponent(gtfsId)}`
    : `/${PREFIX_STOPS}/${encodeURIComponent(gtfsId)}`;
  if (tab) {
    path = `${path}/${tab}`;
  }
  if (search) {
    path = `${path}/${search}`;
  }
  return path;
}

export function definesItinerarySearch(origin, destination) {
  return get(origin, 'address') && get(destination, 'address');
}

/**
 * use objects instead of strings If both are set it's itinerary search...
 */
export function getPathWithEndpointObjects(origin, destination, rootPath) {
  return rootPath === PREFIX_ITINERARY_SUMMARY ||
    definesItinerarySearch(origin, destination)
    ? getItineraryPagePath(locationToUri(origin), locationToUri(destination))
    : getIndexPath(locationToOTP(origin), locationToOTP(destination), rootPath);
}

/**
 * Parses current location from string to location object
 *
 */
export const parseLocation = location => {
  if (isEmpty(location)) {
    return {};
  }
  if (location === 'POS') {
    return { type: 'CurrentLocation' };
  }
  return otpToLocation(decodeURIComponent(location));
};

export const getHomeUrl = (origin, indexPath) => {
  return getPathWithEndpointObjects(origin, {}, indexPath);
};

export const streetHash = {
  walk: 'walk',
  bike: 'bike',
  bikeAndVehicle: 'bikeAndVehicle',
  car: 'car',
  carAndVehicle: 'carAndVehicle',
  parkAndRide: 'parkAndRide',
};
