import { getNameLabel } from '@digitransit-search-util/digitransit-search-util-uniq-by-label';
/**
 * Returns label for properties
 *
 * @name getLabel
 * @param {*} properties object that contains 
 * @returns {Boolean} true/false
 * @example
 * const properties: {
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
 * digitransit-search-util.getLabel(param1, param2);
 * //=true
 */
export default function getLabel(properties) {
  const parts = getNameLabel(properties, true);
  switch (properties.layer) {
    case 'selectFromMap':
    case 'currentPosition':
    case 'selectFromOwnLocations':
      return parts[1] || parts[0];
    case 'favouritePlace':
      return parts[0];
    default:
      return parts.length > 1 && parts[1] !== ''
        ? parts.join(', ')
        : parts[1] || parts[0];
  }
}
