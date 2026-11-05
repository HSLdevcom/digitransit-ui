import getLabel from '@digitransit-search-util/digitransit-search-util-get-label';

const getStopCode = ({ id, code }) => {
  if (code) {
    return code;
  }
  if (
    id === undefined ||
    typeof id.indexOf === 'undefined' ||
    id.indexOf('#') === -1
  ) {
    return undefined;
  }
  // id from pelias
  return id.substring(id.indexOf('#') + 1);
};

export const getGTFSId = ({ id, gtfsId }) => {
  if (gtfsId) {
    return gtfsId;
  }

  if (id && typeof id.indexOf === 'function' && id.indexOf('GTFS:') === 0) {
    if (id.indexOf('#') === -1) {
      return id.substring(5);
    }
    return id.substring(5, id.indexOf('#'));
  }

  return undefined;
};

export default function suggestionToLocation(item) {
  const name = getLabel(item.properties);
  return {
    gid: item.properties.gid,
    address: name,
    name: item.properties.name,
    type: item.type,
    gtfsId: getGTFSId(item.properties),
    code: getStopCode(item.properties),
    layer: item.properties.layer,
    lat:
      item.lat ||
      (item.geometry &&
        item.geometry.coordinates &&
        item.geometry.coordinates[1]),
    lon:
      item.lon ||
      (item.geometry &&
        item.geometry.coordinates &&
        item.geometry.coordinates[0]),
  };
}
