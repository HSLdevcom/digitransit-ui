/**
 * Calculates distance betweeh two points.
 *
 * @name distance
 * @param {Object} latlon1 object containing lat, lon values
 * @param {Object} latlon2 object containing lat, lon values
 * @returns {Number} distance between two points
 * @example
 *  const latlon1 = {
      lat: 3,
      lon: 2,
    };
    const latlon2 = {
      lat: 4,
      lon: 1,
    };
 * digitransit-util.distance(latlon1, latlon2);
 * //=157105.77709637067
 */

// Radius of the earth.
const RADIUS = 6371000;

export default function distance(latlon1, latlon2) {
  const rad = Math.PI / 180;
  const lat1 = latlon1.lat * rad;
  const lat2 = latlon2.lat * rad;
  const sinDLat = Math.sin(((latlon2.lat - latlon1.lat) * rad) / 2);
  const sinDLon = Math.sin(((latlon2.lon - latlon1.lon) * rad) / 2);
  const a =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return RADIUS * c;
}
