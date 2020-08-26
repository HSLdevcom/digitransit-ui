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
export default function isDuplicate(item1, item2) {
  const props1 = item1.properties;
  const props2 = item2.properties;

  if (item1.type === 'FutureRoute' && item2.type === 'FutureRoute') {
    const o1 = props1.origin;
    const d1 = props1.destination;
    const o2 = props2.origin;
    const d2 = props2.destination;

    const name1 = `${o1.name}//${d1.name}//${props1.arriveBy}//${
      props1.timestamp
    }`;
    const name2 = `${o2.name}//${d2.name}//${props2.arriveBy}//${
      props2.timestamp
    }`;
    const label1 = `${o1.label}//${d1.label}//${props1.arriveBy}//${
      props1.timestamp
    }`;
    const label2 = `${o2.label}//${d2.label}//${props2.arriveBy}//${
      props2.timestamp
    }`;

    if (
      Math.abs(o1.coordinates[0] - o2.coordinates[0]) < 1e-6 &&
      Math.abs(o1.coordinates[1] - o2.coordinates[1]) < 1e-6 &&
      Math.abs(d1.coordinates[0] - d2.coordinates[0]) < 1e-6 &&
      Math.abs(d1.coordinates[1] - d2.coordinates[1]) < 1e-6
    ) {
      if (truEq(name1, name2) || truEq(label1, label2)) {
        return true;
      }
    }
    return false;
  } else if (item1.type === 'FutureRoute' || item2.type === 'FutureRoute') {
    return false;
  }
  if (truEq(props1.gtfsId, props2.gtfsId)) {
    return true;
  }
  if (props1.gtfsId && props2.gid && props2.gid.includes(props1.gtfsId)) {
    return true;
  }
  if (props2.gtfsId && props1.gid && props1.gid.includes(props2.gtfsId)) {
    return true;
  }

  const p1 = item1.geometry.coordinates;
  const p2 = item2.geometry.coordinates;

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
