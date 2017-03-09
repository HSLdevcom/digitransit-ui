import unzip from 'lodash/unzip';
import { isBrowser } from './browser';

/* eslint-disable global-require */
const L = isBrowser ? require('leaflet') : null;
/* eslint-enable global-require */

function toRad(deg) {
  return deg * (Math.PI / 180);
}

function toDeg(rad) {
  return rad * (180 / Math.PI);
}

export function getBearing(lat1, lng1, lat2, lng2) {
  const lonScale = Math.cos(toRad((lat1 + lat2) / 2));
  const dy = lat2 - lat1;
  const dx = (lng2 - lng1) * lonScale;
  return (toDeg(Math.atan2(dx, dy)) + 360) % 360;
}

export function getLatLng(lat, lon) {
  return new L.LatLng(lat, lon);
}

export function getDistanceToNearestStop(lat, lon, stops) {
  const myPos = new L.LatLng(lat, lon);
  let minDist = Number.MAX_VALUE;
  let minStop = null;

  stops.forEach((stop) => {
    const stopPos = new L.LatLng(stop.lat, stop.lon);
    const distance = myPos.distanceTo(stopPos);

    if (distance < minDist) {
      minDist = distance;
      minStop = stop;
    }
  });

  return { stop: minStop, distance: minDist };
}

export function getDistanceToFurthestStop(coordinates, stops) {
  return stops.map(stop =>
    ({
      stop,
      distance: coordinates.distanceTo(new L.LatLng(stop.lat, stop.lon)),
    }),
  ).reduce((previous, current) => (current.distance > previous.distance ? current : previous),
           { stop: null, distance: 0 });
}

export function displayDistance(meters) {
  /* eslint-disable yoda */
  if (meters < 100) {
    return `${Math.round(meters / 10) * 10} m`; // Tens of meters
  } else if (meters < 1000) {
    return `${Math.round(meters / 50) * 50} m`; // fifty meters
  } else if (meters < 10000) {
    return `${(Math.round(meters / 100) * 100) / 1000} km`; // hudreds of meters
  } else if (meters < 100000) {
    return `${Math.round(meters / 1000)} km`; // kilometers
  }
  return `${Math.round(meters / 10000) * 10} km`; // tens of kilometers
  /* eslint-enable yoda */
}

// Return the bounding box of a latlon array of length > 0
// If the box is smaller than 0.002x0.002, add padding
export function boundWithMinimumArea(points) {
  if (!points || !points[0]) { return null; }
  const [lats, lons] = unzip(points.filter(([lat, lon]) => (!isNaN(lat) && !isNaN(lon))));
  const minlat = Math.min(...lats);
  const minlon = Math.min(...lons);
  const maxlat = Math.max(...lats);
  const maxlon = Math.max(...lons);
  const missingHeight = Math.max(0, 0.002 - (maxlat - minlat));
  const missingWidth = Math.max(0, 0.002 - (maxlon - minlon));
  return [[minlat - (missingHeight / 2), minlon - (missingWidth / 2)],
          [maxlat + (missingHeight / 2), maxlon + (missingWidth / 2)]];
}

function getLengthOf(geometry) {
  let d = 0;

  for (let i = 0; i < geometry.length - 1; ++i) {
    const dlat = geometry[i + 1][0] - geometry[i][0];
    const dlon = geometry[i + 1][1] - geometry[i][1];
    d += Math.sqrt((dlat * dlat) + (dlon * dlon));
  }

  return d;
}

function getMiddleIndexOf(geometry) {
  let middleIndex = 0;
  let distanceSoFar = 0;
  const distanceToHalf = getLengthOf(geometry) * 0.5;

  for (let i = 0; i < geometry.length - 1; ++i) {
    const dlat = geometry[i + 1][0] - geometry[i][0];
    const dlon = geometry[i + 1][1] - geometry[i][1];
    distanceSoFar += Math.sqrt((dlat * dlat) + (dlon * dlon));
    if (distanceSoFar >= distanceToHalf) {
      middleIndex = i;
      break;
    }
  }
  return middleIndex;
}

export function getMiddleOf(geometry) {
  if (geometry.length <= 0) return { lat: 0, lon: 0 };
  if (geometry.length === 1) return { lat: geometry[0][0], lon: geometry[0][1] };

  const i = Math.max(1, getMiddleIndexOf(geometry));

  return {
    lat: geometry[i - 1][0] + (0.5 * (geometry[i][0] - geometry[i - 1][0])),
    lon: geometry[i - 1][1] + (0.5 * (geometry[i][1] - geometry[i - 1][1])),
  };
}

// Sourced from http://paulbourke.net/geometry/polygonmesh/javascript.txt
export class Contour {
  constructor(pts) {
    this.pts = pts;
  }

  area() {
    let area = 0;
    const pts = this.pts;
    const nPts = pts.length;
    let j = nPts - 1;
    let p1;
    let p2;

    for (let i = 0; i < nPts; j = i++) { // eslint-disable-line no-plusplus
      p1 = pts[i]; p2 = pts[j];
      area += p1.x * p2.y;
      area -= p1.y * p2.x;
    }
    area /= 2;
    return area;
  }

  centroid() {
    const pts = this.pts;
    const nPts = pts.length;
    let x = 0;
    let y = 0;
    let f;
    let j = nPts - 1;
    let p1;
    let p2;

    for (let i = 0; i < nPts; j = i++) { // eslint-disable-line no-plusplus
      p1 = pts[i]; p2 = pts[j];
      f = (p1.x * p2.y) - (p2.x * p1.y);
      x += (p1.x + p2.x) * f;
      y += (p1.y + p2.y) * f;
    }

    f = this.area() * 6;
    return { x: x / f, y: y / f };
  }
}
