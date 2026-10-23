/* eslint-disable camelcase */
import unzip from 'lodash/unzip';

import distance from '@digitransit-search-util/digitransit-search-util-distance';
import { toRad } from '../shared/geo-utils';
import { isImperial } from './browser';

export function displayImperialDistance(meters) {
  const feet = meters * 3.2808399;

  /* eslint-disable yoda */

  if (feet < 100) {
    return `${Math.round(feet / 10) * 10} ft`; // Tens of feet
  }
  if (feet < 1000) {
    return `${Math.round(feet / 50) * 50} ft`; // fifty feet
  }
  return `${Math.round(feet / 528) / 10} mi`; // tenth of a mile
}

/**
 * Returns distance with locale format (fraction digits is 1)
 * e.g. fi/sv - 20,1 km, en - 20.1 km
 * @param {*} meters
 * @param {*} formatNumber
 */
function displayDistanceWithLocale(meters, formatNumber) {
  const opts = {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  };
  if (meters < 100) {
    return `${formatNumber((Math.round(meters / 10) * 10).toFixed(1))} m`; // Tens of meters
  }
  if (meters < 975) {
    return `${formatNumber((Math.round(meters / 50) * 50).toFixed(1))} m`; // fifty meters
  }
  if (meters < 10000) {
    return `${formatNumber(
      ((Math.round(meters / 100) * 100) / 1000).toFixed(1),
      opts,
    )} km`; // hudreds of meters
  }
  if (meters < 100000) {
    return `${formatNumber(Math.round(meters / 1000).toFixed(1), opts)} km`; // kilometers
  }
  return `${formatNumber(
    (Math.round(meters / 10000) * 10).toFixed(1),
    opts,
  )} km`; // tens of kilometers
}

export function displayDistance(meters, config, formatNumber) {
  if (config.alwaysShowDistanceInKm) {
    return `${(meters / 1000).toFixed(1)}  km`;
  }
  if (isImperial(config)) {
    return displayImperialDistance(meters);
  }
  if (formatNumber) {
    return displayDistanceWithLocale(meters, formatNumber);
  }
  if (meters < 100) {
    return `${Math.round(meters / 10) * 10} m`; // Tens of meters
  }
  if (meters < 975) {
    return `${Math.round(meters / 50) * 50} m`; // fifty meters
  }
  if (meters < 10000) {
    return `${(Math.round(meters / 100) * 100) / 1000} km`; // hudreds of meters
  }
  if (meters < 100000) {
    return `${Math.round(meters / 1000)} km`; // kilometers
  }
  return `${Math.round(meters / 10000) * 10} km`; // tens of kilometers
}

/* export function displayDistance2(meters) {
  return `${(meters / 1000).toFixed(1)}  km`;
}
 */
/* eslint-enable yoda */

// Return the bounding box of a latlon array of length > 0
export function boundWithMinimumArea(points, maxZoom = 18) {
  if (!points || !points[0]) {
    return null;
  }
  const e = Math.max(0, 18 - maxZoom);
  const dist = 0.002 * 2 ** e;
  const [lats, lons] = unzip(
    points.filter(([lat, lon]) => !Number.isNaN(lat) && !Number.isNaN(lon)),
  );
  const minlat = Math.min(...lats);
  const minlon = Math.min(...lons);
  const maxlat = Math.max(...lats);
  const maxlon = Math.max(...lons);
  const missingHeight = Math.max(0, dist - (maxlat - minlat));
  const missingWidth = Math.max(0, dist - (maxlon - minlon));
  return [
    [minlat - missingHeight / 2, minlon - missingWidth / 2],
    [maxlat + missingHeight / 2, maxlon + missingWidth / 2],
  ];
}

function getLengthOf(geometry) {
  let d = 0;

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < geometry.length - 1; ++i) {
    const dlat = geometry[i + 1][0] - geometry[i][0];
    const dlon = geometry[i + 1][1] - geometry[i][1];
    d += Math.sqrt(dlat * dlat + dlon * dlon);
  }

  return d;
}

function getMiddleIndexOf(geometry) {
  let middleIndex = 0;
  let distanceSoFar = 0;
  const distanceToHalf = getLengthOf(geometry) * 0.5;

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < geometry.length - 1; ++i) {
    const dlat = geometry[i + 1][0] - geometry[i][0];
    const dlon = geometry[i + 1][1] - geometry[i][1];
    distanceSoFar += Math.sqrt(dlat * dlat + dlon * dlon);
    if (distanceSoFar >= distanceToHalf) {
      middleIndex = i;
      break;
    }
  }
  return middleIndex;
}

export function getMiddleOf(geometry) {
  if (geometry.length <= 0) {
    return { lat: 0, lon: 0 };
  }
  if (geometry.length === 1) {
    return { lat: geometry[0][0], lon: geometry[0][1] };
  }

  const i = Math.max(1, getMiddleIndexOf(geometry));

  return {
    lat: geometry[i - 1][0] + 0.5 * (geometry[i][0] - geometry[i - 1][0]),
    lon: geometry[i - 1][1] + 0.5 * (geometry[i][1] - geometry[i - 1][1]),
  };
}

/**
 * Checks if the given geometry exists and has type 'MultiPoint'.
 *
 * @param {{ type: string }} geometry the geometry object to check.
 */
export const isMultiPointTypeGeometry = geometry =>
  !!(geometry && geometry.type === 'MultiPoint');

/**
 * Checks if the given geometry exists and has type 'Point'.
 *
 * @param {{ type: string }} geometry the geometry object to check.
 */
export const isPointTypeGeometry = geometry =>
  !!(geometry && geometry.type === 'Point');

/**
 * Caluclates itinerary distance as the crow flies
 *
 */
export function estimateItineraryDistance(from, to, viaPoints = []) {
  let dist = 0;
  const points = [...[from], ...viaPoints, ...[to]];
  const arrayLength = points.length;
  for (let i = 0; i < arrayLength - 1; i++) {
    dist += distance(points[i], points[i + 1]);
  }

  return dist;
}

/**
 * Dot product
 *
 */
function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}

/**
 * Calculate the point between points a and b that is closest to point c
 *
 * @param {{lat: number, lon: number}} a
 * @param {{lat: number, lon: number}} b
 * @param {{lat: number, lon: number}} c
 *
 * @return {{lat: number, lon: number}}
 */
export function getClosestPoint(a, b, c) {
  // calculate orthogonal projection into line ab first
  const v1 = [b.lon - a.lon, b.lat - a.lat];
  const v2 = [c.lon - a.lon, c.lat - a.lat];
  const res1 = dot(v2, v1) / dot(v1, v1);
  const res2 = [res1 * v1[0], res1 * v1[1]];
  const result = { lon: res2[0] + a.lon, lat: res2[1] + a.lat };

  // If projected point is not between a and b, return a or b whichever is closest
  const epsilon = 1;
  const distA = distance(a, result);
  const distB = distance(b, result);
  if (distA + distB < distance(a, b) + epsilon) {
    return result;
  }
  return distA < distB ? a : b;
}

// WGS84 to local planar coordinates
// Usage: origin = GeodeticToEcef(lat0,  lon0);
// { x, y } = GeodeticToEnu(lat, lon, origin);

const a = 6378137.0; // WGS-84 Earth semimajor axis (m)
const b = 6356752.314245; // Derived Earth semiminor axis (m)
const f = (a - b) / a; // Ellipsoid Flatness
const e_sq = f * (2 - f); // Square of Eccentricity
const inv_e_sq = 1 - e_sq;

// Converts WGS-84 Geodetic point (lat, lon) at ground level 0 to
// Earth-Centered Earth-Fixed (ECEF) coordinates (x, y, z)
export function GeodeticToEcef(lat, lon) {
  const lambda = toRad(lat);
  const phi = toRad(lon);
  const sin_lambda = Math.sin(lambda);
  const cos_lambda = Math.cos(lambda);
  const cos_phi = Math.cos(phi);
  const sin_phi = Math.sin(phi);
  const N = a / Math.sqrt(1 - e_sq * sin_lambda * sin_lambda);

  const x = N * cos_lambda * cos_phi;
  const y = N * cos_lambda * sin_phi;
  const z = N * inv_e_sq * sin_lambda;

  return { x, y, z, sin_lambda, cos_lambda, cos_phi, sin_phi };
}

// Converts the earth-centered earth-fixed (ECEF) coordinates (x, y, z) to
// east-north coordinates in a local tangent plane defined by an ECEF point origin
function EcefToEnu(e, origin) {
  const xd = e.x - origin.x;
  const yd = e.y - origin.y;
  const zd = e.z - origin.z;

  const xEast = -origin.sin_phi * xd + origin.cos_phi * yd;
  const yNorth =
    -origin.cos_phi * origin.sin_lambda * xd -
    origin.sin_lambda * origin.sin_phi * yd +
    origin.cos_lambda * zd;

  return { x: xEast, y: yNorth };
}

// Converts the geodetic WGS-84 coordinated (lat, lon) at ground level to
// east-north coordinates in a local tangent plane defined by an ECEF point origin
export function GeodeticToEnu(lat, lon, origin) {
  const ecef = GeodeticToEcef(lat, lon);
  return EcefToEnu(ecef, origin);
}
