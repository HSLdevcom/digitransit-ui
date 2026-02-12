/**
 * Create Features for a given list of objects
 */
export function createFeatureObjects(objects) {
  return objects.map(object => ({
    type: 'Feature',
    properties: object.properties,
    geometry: {
      type: 'Point',
      coordinates: [object.lat, object.lon],
    },
  }));
}
