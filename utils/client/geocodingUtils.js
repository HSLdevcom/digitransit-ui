import { getJson } from '../shared/xhrPromise';

/**
 * Reverse geocodes a position with Pelias.
 * Resolves to the address fields of the first match, or {} when nothing is found.
 * Rejects when the request fails.
 */
export function reverseGeocode(config, coords) {
  const searchParams = {
    'point.lat': coords.latitude,
    'point.lon': coords.longitude,
    lang: config.language,
    size: 1,
    layers: 'address',
  };

  if (config.searchParams['boundary.country']) {
    searchParams['boundary.country'] = config.searchParams['boundary.country'];
  }

  return getJson(config.URL.PELIAS_REVERSE_GEOCODER, searchParams).then(
    data => {
      if (data.features != null && data.features.length > 0) {
        const match = data.features[0].properties;
        return {
          address: match.name,
          gid: match.gid,
          name: match.name,
          layer: match.layer,
          city: match.localadmin || match.locality,
        };
      }
      return {};
    },
  );
}
