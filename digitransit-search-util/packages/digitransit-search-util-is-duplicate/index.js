import truEq from '@digitransit-search-util/digitransit-search-util-tru-eq';
/**
 * Checks that is items duplicate
 *
 * @name isDuplicate
 * @param {Object} item1 Object containing following attributes:
 * {
 *  properties {
 *      gtfsId: String
 *      gid: String from geocoder
 *      name: String
 *      label: String
 *       address: String
 *      geometry {
 *         coordinates [Number lat, Number lon]
 *      }
 *  }
 * }
 * @param {Object} item2 Object with same attributes as item1
 * @returns {Boolean} true/false
 * @example
 * digitransit-util.isDuplicate(param1, param2);
 * //=true
 */

const gtfsStopLayers = ['stop', 'station', 'favouriteStop', 'favouriteStation'];
const vehicleRentalLayers = ['favouriteVehicleRentalStation', 'bikestation'];

function labelIdToGid(id) {
  if (!id) {
    return '';
  }
  const parts = id.split(':');
  if (parts.length === 0) {
    return '';
  }
  return `citybikes${parts[0]}:bikestation:${parts[1]}`;
}

export default function isDuplicate(item1, item2) {
  const props1 = item1.properties;
  const props2 = item2.properties;

  if (item1.type === 'FutureRoute' && item2.type === 'FutureRoute') {
    const o1 = props1.origin;
    const d1 = props1.destination;
    const o2 = props2.origin;
    const d2 = props2.destination;

    const name1 = `${o1.name}//${o1.locality}//${d1.name}//${d1.locality}`;
    const name2 = `${o2.name}//${o2.locality}//${d2.name}//${d2.locality}`;

    return name1 === name2;
  }
  if (item1.type === 'FutureRoute' || item2.type === 'FutureRoute') {
    return false;
  }
  if (
    vehicleRentalLayers.includes(props1.layer) &&
    vehicleRentalLayers.includes(props2.layer)
  ) {
    const id1 = props1.gid || labelIdToGid(props1.labelId);
    const id2 = props2.gid || labelIdToGid(props2.labelId);
    return id1 === id2;
  }
  if (props1.gtfsId && props2.gtfsId) {
    return props1.gtfsId === props2.gtfsId;
  }
  if (
    gtfsStopLayers.includes(props1.layer) &&
    gtfsStopLayers.includes(props2.layer) &&
    props1.gid &&
    props2.gid
  ) {
    return props1.gid === props2.gid;
  }

  const p1 = item1 && item1.geometry ? item1.geometry.coordinates : undefined;
  const p2 = item2 && item2.geometry ? item2.geometry.coordinates : undefined;

  if (p1 && p2) {
    // both have geometry
    if (Math.abs(p1[0] - p2[0]) < 1e-6 && Math.abs(p1[1] - p2[1]) < 1e-6) {
      // location match is not enough. Require a common property
      if (
        truEq(props1.name, props2.name) ||
        truEq(props1.label, props2.label) ||
        truEq(props1.address, props2.address) ||
        truEq(props1.address, props2.label) ||
        truEq(props1.label, props2.address)
      ) {
        return true;
      }
    }
  }
  return false;
}
