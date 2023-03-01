import get from 'lodash/get';
import trimEnd from 'lodash/trimEnd';
import trimStart from 'lodash/trimStart';
import toPairs from 'lodash/toPairs';
import {
  otpToLocation,
  locationToOTP,
  addressToItinerarySearch,
} from './otpStrings';

export const TAB_NEARBY = 'indernaehe';
export const TAB_FAVOURITES = 'favouriten';
export const PREFIX_ROUTES = 'routen';
export const PREFIX_NEARYOU = TAB_NEARBY;
export const PREFIX_STOPS = 'haltestellen';
export const PREFIX_BIKESTATIONS = 'station';
export const PREFIX_TERMINALS = 'busbahnhoefe';
export const PREFIX_ITINERARY_SUMMARY = 'reiseplan';
export const PREFIX_DISRUPTION = 'stoerungen';
export const PREFIX_TIMETABLE = 'fahrplan';
export const PREFIX_ROADWORKS = 'baustellen';
export const PREFIX_BIKEPARK = 'fahrradparkplaetze';
export const PREFIX_CHARGING_STATIONS = 'ladestationen';
export const PREFIX_CARPARK = 'parkplaetze';
export const PREFIX_ROAD_WEATHER = 'strassenwetter';
export const PREFIX_DATAHUB_POI = 'datahub-poi';
export const PREFIX_GEOJSON = 'geojson';
export const stopUrl = id => id;
export const LOCAL_STORAGE_EMITTER_PATH = '/local-storage-emitter';
export const EMBEDDED_SEARCH_PATH = '/haku';

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

export const joinPrefixAndId = (prefix, id) => {
  // The prefix might contain intentional path separators, so we don't encode it here
  return `/${prefix}/${encodeURIComponent(id)}`;
};
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
      path = `/${PREFIX_BIKESTATIONS}/`;
      id = searchObj.properties.labelId;
      break;
    case 'bikestation':
      path = `/${PREFIX_BIKESTATIONS}/`;
      id = searchObj.properties.id;
      break;
    case 'favouriteBikestation':
    case 'favouriteBikeRentalStation':
      path = `/${PREFIX_BIKESTATIONS}/`;
      id = searchObj.properties.labelId;
      break;
    case 'carpark':
      path = `/${PREFIX_CARPARK}/`;
      id =
        searchObj.properties.id.indexOf(':') === -1
          ? searchObj.properties.id
          : searchObj.properties.id.split(':')[1];
      break;
    case 'bikepark':
      path = `/${PREFIX_BIKEPARK}/`;
      id =
        searchObj.properties.id.indexOf(':') === -1
          ? searchObj.properties.id
          : searchObj.properties.id.split(':')[1];
      break;
    default:
      path = `/${PREFIX_STOPS}/`;
      id = id.replace('GTFS:', '').replace(':', '%3A');
  }
  return path.concat(id);
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
      : getIndexPath(
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
    return {};
  }
  if (location === 'POS') {
    return { type: 'CurrentLocation' };
  }
  const parsed = otpToLocation(decodeURIComponent(location));

  return parsed;
};

export const getHomeUrl = (origin, indexPath) => {
  // TODO consider looking at destination too
  const homeUrl = getPathWithEndpointObjects(origin, {}, indexPath);

  return homeUrl;
};

export const getDatahubPoiPath = (datahubId, name, latitude, longitude) => {
  const searchParams = new URLSearchParams({
    datahubId,
    name,
    // We follow SidebarMap's parameter naming here.
    lat: latitude,
    lng: longitude,
  }).toString();
  return `/${PREFIX_DATAHUB_POI}?${searchParams}`;
};
