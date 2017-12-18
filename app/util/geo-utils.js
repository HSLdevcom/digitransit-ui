import unzip from 'lodash/unzip';
import { isImperial } from './browser';

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

const RADIUS = 6371000;

export function distance(latlng1, latlng2) {
  const rad = Math.PI / 180;
  const lat1 = latlng1.lat * rad;
  const lat2 = latlng2.lat * rad;
  const sinDLat = Math.sin((latlng2.lat - latlng1.lat) * rad / 2);
  const sinDLon = Math.sin((latlng2.lng - latlng1.lng) * rad / 2);
  const a =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return RADIUS * c;
}

export function getDistanceToNearestStop(lat, lng, stops) {
  const myPos = { lat, lng };
  let minDist = Number.MAX_VALUE;
  let minStop = null;

  stops.forEach(stop => {
    const stopPos = { lat: stop.lat, lng: stop.lon };
    const dist = distance(myPos, stopPos);

    if (dist < minDist) {
      minDist = dist;
      minStop = stop;
    }
  });

  return { stop: minStop, distance: minDist };
}

export function displayImperialDistance(meters) {
  const feet = meters * 3.2808399;

  /* eslint-disable yoda */

  if (feet < 100) {
    return `${Math.round(feet / 10) * 10} ft`; // Tens of feet
  } else if (feet < 1000) {
    return `${Math.round(feet / 50) * 50} ft`; // fifty feet
  }
  return `${Math.round(feet / 528) / 10} mi`; // tenth of a mile
}

export function displayDistance(meters, config) {
  if (isImperial(config)) {
    return displayImperialDistance(meters);
  }
  if (meters < 100) {
    return `${Math.round(meters / 10) * 10} m`; // Tens of meters
  } else if (meters < 1000) {
    return `${Math.round(meters / 50) * 50} m`; // fifty meters
  } else if (meters < 10000) {
    return `${Math.round(meters / 100) * 100 / 1000} km`; // hudreds of meters
  } else if (meters < 100000) {
    return `${Math.round(meters / 1000)} km`; // kilometers
  }
  return `${Math.round(meters / 10000) * 10} km`; // tens of kilometers
}

/* eslint-enable yoda */

// Return the bounding box of a latlon array of length > 0
// If the box is smaller than 0.002x0.002, add padding
export function boundWithMinimumArea(points) {
  if (!points || !points[0]) {
    return null;
  }
  const [lats, lons] = unzip(
    points.filter(([lat, lon]) => !Number.isNaN(lat) && !Number.isNaN(lon)),
  );
  const minlat = Math.min(...lats);
  const minlon = Math.min(...lons);
  const maxlat = Math.max(...lats);
  const maxlon = Math.max(...lons);
  const missingHeight = Math.max(0, 0.002 - (maxlat - minlat));
  const missingWidth = Math.max(0, 0.002 - (maxlon - minlon));
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

// Sourced from http://paulbourke.net/geometry/polygonmesh/javascript.txt
export class Contour {
  constructor(pts) {
    this.pts = pts;
  }

  area() {
    let area = 0;
    const { pts } = this;
    const nPts = pts.length;
    let j = nPts - 1;
    let p1;
    let p2;

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < nPts; j = i++) {
      p1 = pts[i];
      p2 = pts[j];
      area += p1.x * p2.y;
      area -= p1.y * p2.x;
    }
    area /= 2;
    return area;
  }

  centroid() {
    const { pts } = this;
    const nPts = pts.length;
    let x = 0;
    let y = 0;
    let f;
    let j = nPts - 1;
    let p1;
    let p2;

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < nPts; j = i++) {
      p1 = pts[i];
      p2 = pts[j];
      f = p1.x * p2.y - p2.x * p1.y;
      x += (p1.x + p2.x) * f;
      y += (p1.y + p2.y) * f;
    }

    f = this.area() * 6;
    return { x: x / f, y: y / f };
  }
}
