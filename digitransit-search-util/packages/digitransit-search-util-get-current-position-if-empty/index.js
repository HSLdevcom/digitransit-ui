/**
 * Returns current position if given input is empty
 *
 * @name getCurrentPositionIfEmpty
 * @param {String} input 
 * @param {Object} position object: 
 *  {
 *    address: String,
 *     lat: Number,
 *     lon: Number,
 *   };
 * 
 * @returns {Object} Promise Array with object: 
 *  [{
 *   type: String
 *   address: String,
 *   lat: Number,
 *   lon: Number,
 *   properties: {
 *    labelId: String
 *    layer: String
 *    address: String
 *    lat: Number
 *    lon: Number
 *   },
 *    geometry: {
 *      type: String,
 *      coordinates: [Number, Number]
 *     }
 * }]
 * @example
 *  const position = {
      address: 'TestAddress',
      lat: 3,
      lon: 2,
    };
 * digitransit-search-util.getCurrentPositionIfEmpty('', position);
 * //= Promise {[{
 *   type: CurrentLocation
 *   address: 'TestAddress',
 *   lat: 3,
 *   lon: 2,
 *   properties: {
 *    labelId: 'use-own-position',
 *    layer: 'currentPosition',
 *    address: 'TestAddress'
 *    lat: 3
 *    lon: 2
 *   },
 *    geometry: {
 *      type: 'Pooint',
 *      coordinates: [3, 2]
 *     }
 * }]}
 */
export default function getCurrentPositionIfEmpty(input, position) {
  if (typeof input !== 'string' || input.length === 0) {
    return Promise.resolve([
      {
        type: 'CurrentLocation',
        address: position.address,
        lat: position.lat,
        lon: position.lon,
        properties: {
          labelId: 'use-own-position',
          layer: 'currentPosition',
          address: position.address,
          lat: position.lat,
          lon: position.lon,
        },
        geometry: {
          type: 'Point',
          coordinates: [position.lon, position.lat],
        },
      },
    ]);
  }

  return Promise.resolve([]);
}
