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

/**
 * Converst suggestion to location
 *
 * @name suggestionToLocation
 * @param {*} item Your suggestion
 * @returns {*} Location object
 * @example
 * const item = {
 *  properties: {
    "id": "GTFS:MATKA:318915",
    "gid": "gtfsmatka:station:GTFS:MATKA:318915",
    "layer": "station",
    "source": "gtfsmatka",
    "source_id": "GTFS:MATKA:318915",
    "name": "Rautatientori",
    "postalcode": "00100",
    "postalcode_gid": "whosonfirst:postalcode:421479569",
    "confidence": 1,
    "accuracy": "centroid",
    "country": "Suomi",
    "country_gid": "whosonfirst:country:0",
    "country_a": "FIN",
    "region": "Uusimaa",
    "region_gid": "whosonfirst:region:85683067",
    "localadmin": "Helsinki",
    "localadmin_gid": "whosonfirst:localadmin:907199715",
    "locality": "Helsinki",
    "locality_gid": "whosonfirst:locality:101748417",
    "neighbourhood": "Kluuvi",
    "neighbourhood_gid": "whosonfirst:neighbourhood:85898847",
    "label": "Rautatientori, koillinen, Kluuvi, Helsinki"
        }
     type: "Favourite"
     lat: 0
     lon: 0 

 *  }
 * digitransit-search-util.suggestionToLocation(param1, param2);
 * //= {
 *    id: item.properties.gid,
    address: name,
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
 * }
 */
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
