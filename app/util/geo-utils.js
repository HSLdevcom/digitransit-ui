import unzip from 'lodash/unzip';
/* eslint-disable global-require */
const L = (typeof window !== 'undefined' && window !== null) ? require('leaflet') : null;
/* eslint-enable global-require */

function toRad(deg) {
  return deg * Math.PI / 180;
}

function toDeg(rad) {
  return rad * 180 / Math.PI;
}

export function getBearing(lat1, lng1, lat2, lng2) {
  const lonScale = Math.cos(toRad((lat1 + lat2) / 2));
  const dy = lat2 - lat1;
  const dx = (lng2 - lng1) * lonScale;
  return (toDeg(Math.atan2(dx, dy)) + 360) % 360;
}

export function getTopicsForPlan(plan) {
  for (const leg of plan.legs) {
    if (leg.transitLeg && leg.agencyId === 'HSL') {
      return { route: leg.routeId.split(':')[1] };
    }
  }
  return null;
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
  return stops.map((stop) =>
    ({
      stop,
      distance: coordinates.distanceTo(new L.LatLng(stop.lat, stop.lon)),
    })
  ).reduce((previous, current) => (current.distance > previous.distance ? current : previous),
           { stop: null, distance: 0 });
}

export function displayDistance(meters) {
  /* eslint-disable yoda */
  if (meters < 100) {
    return `${Math.round(meters / 10) * 10} m`;
  } else if (100 < meters < 1000) {
    return `${Math.round(meters / 50) * 50} m`;
  } else if (1000 < meters < 10000) {
    return `${Math.round(meters / 100) * 100 / 1000} km`;
  } else if (10000 < meters < 100000) {
    return `${Math.round(meters / 1000)} km`;
  }
  return `${Math.round(meters / 10000) * 10} km`;
  /* eslint-enable yoda */
}

// Return the bounding box of a latlon array of length > 0
// If the box is smaller than 0.002x0.002, add padding
export function boundWithMinimumArea(points) {
  if (!points || !points[0]) { return null; }
  const [lats, lons] = unzip(points);
  const minlat = Math.min(...lats);
  const minlon = Math.min(...lons);
  const maxlat = Math.max(...lats);
  const maxlon = Math.max(...lons);
  const missingHeight = Math.max(0, 0.002 - (maxlat - minlat));
  const missingWidth = Math.max(0, 0.002 - (maxlon - minlon));
  return [[minlat - missingHeight / 2, minlon - missingWidth / 2],
          [maxlat + missingHeight / 2, maxlon + missingWidth / 2]];
}
