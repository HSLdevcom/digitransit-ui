import getLabel from './getLabel.js';
import { getStopCode } from './uniqueByLabel.js';

export const getGtfsId = ({ id, gtfsId }) => {
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
    gtfsId: getGtfsId(item.properties),
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
