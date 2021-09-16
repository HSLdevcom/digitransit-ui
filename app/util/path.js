import get from 'lodash/get';
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
export const PREFIX_BIKE_PARKS = 'fahrradparkplaetze';
export const PREFIX_CHARGING_STATIONS = 'ladestationen';
export const PREFIX_DYNAMIC_PARKING_LOTS = 'parkplaetze';
export const PREFIX_ROAD_WEATHER = 'strassenwetter';
export const PREFIX_GEOJSON = 'geojson';
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
