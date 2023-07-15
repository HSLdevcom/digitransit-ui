import isEmpty from 'lodash/isEmpty.js';
import isString from 'lodash/isString.js';
import trim from 'lodash/trim.js';

// Convert between location objects (address, lat, lon)
// and string format OpenTripPlanner uses in many places

export const parseLatLon = coords => {
  const latlon = coords.split(',');
  if (latlon.length === 2) {
    const lat = parseFloat(latlon[0]);
    const lon = parseFloat(latlon[1]);
    if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
      return {
        lat,
        lon,
      };
    }
  }
  return undefined;
};

export const otpToLocation = otpString => {
  const [address, coords, slack] = otpString.split('::');
  const location = {
    address,
  };
  if (slack) {
    const parsedSlack = parseInt(slack, 10);
    if (!Number.isNaN(parsedSlack)) {
      location.locationSlack = parsedSlack;
    }
  }
  if (coords) {
    return {
      ...location,
      ...parseLatLon(coords),
    };
  }
  return location;
};

export const addressToItinerarySearch = location => {
  if (
    location.type === 'CurrentLocation' &&
    location.status === 'no-location'
  ) {
    return 'POS';
  }
  if (!location.lat) {
    return '-';
  }
  const address = location.address || '';

  return `${encodeURIComponent(address)}::${location.lat},${location.lon}`;
};

export const locationToOTP = location => {
  if (location.lat) {
    const address = location.address || '';
    const slack = location.locationSlack ? `::${location.locationSlack}` : '';
    return `${address}::${location.lat},${location.lon}${slack}`;
  }
  if (location.type === 'SelectFromMap') {
    return location.type;
  }
  return '-';
};

export const locationToCoords = location => [location.lat, location.lon];

/**
 * Extracts the location information from the intermediatePlaces
 * query parameter, if available. The locations will be returned in
 * non-OTP mode (i.e. mapped to lat?, lon? and address).
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
  }
  if (Array.isArray(intermediatePlaces)) {
    return intermediatePlaces.map(otpToLocation);
  }
  if (isString(intermediatePlaces)) {
    if (isEmpty(trim(intermediatePlaces))) {
      return [];
    }
    return [otpToLocation(intermediatePlaces)];
  }
  return [];
};

/**
 * Splits the name-string to two parts from the first occurance of ', '
 * @param {*} string String to split, e.g 'Ristolantie 15, Helsinki'
 */
export const splitStringToAddressAndPlace = string => {
  return string.split(/, (.+)/);
};
