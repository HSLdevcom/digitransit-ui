import uniqWith from 'lodash/uniqWith';
import isEqual from 'lodash/isEqual';
import memoize from 'lodash/memoize';
import escapeRegExp from 'lodash/escapeRegExp';
import cloneDeep from 'lodash/cloneDeep';

/**
 * Location properties.
 * @typedef {LocationProperties}
 * @property {string} layer Suggestion layer.
 * @property {lat} [number]
 * @property {lon} [number]
 * @property {string} address Address.
 */

/**
 * Returns locality (city name) for suggestions
 *
 * @name getLocality
 * @param {Object} suggestion suggestion's properties from geocoding or a favourite stop/station.
 * Expects last part of an address (after ',') to contain the city name of the suggestion location.
 * @returns {String}  City name or empty string
 */
const getLocality = suggestion =>
  suggestion.localadmin ||
  suggestion.locality ||
  (suggestion.address &&
    suggestion.address.lastIndexOf(',') < suggestion.address.length - 2 &&
    suggestion.address.substring(suggestion.address.lastIndexOf(',') + 2)) ||
  '';

export const getStopCode = ({ id, code }) => {
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

export const formatFavouritePlaceLabel = (name, address) => [
  name || (address && address.split(',')[0]),
  typeof address === 'string'
    ? address.replace(new RegExp(`${escapeRegExp(name)}([ ,]|$)+`), '')
    : '',
];

/**
 * Format suggestion-pair [name, address] by `suggestion.layer`.
 *
 * @name getNameLabel
 * @param {LocationProperties} suggestion
 * @param {boolean} [plain]
 *
 * @returns {Array.<string>} Formatted label.
 */
export const getNameLabel = memoize(
  (suggestion, plain = false) => {
    switch (suggestion.layer) {
      case 'currentPosition':
        return [suggestion.labelId, suggestion.address];
      case 'selectFromMap':
      case 'ownLocations':
      case 'back':
        return [suggestion.labelId];
      case 'favouritePlace':
        return formatFavouritePlaceLabel(suggestion.name, suggestion.address);
      case 'favouriteBikeRentalStation':
      case 'bikeRentalStation':
        return [suggestion.name];
      case 'favouriteRoute':
      case 'route-BUS':
      case 'route-TRAM':
      case 'route-RAIL':
      case 'route-SUBWAY':
      case 'route-FERRY':
      case 'route-FUNICULAR':
      case 'route-AIRPLANE':
        return !plain && suggestion.shortName
          ? [
              suggestion.gtfsId,
              suggestion.mode.toLowerCase(),
              suggestion.longName,
            ]
          : [
              suggestion.shortName,
              suggestion.longName,
              suggestion.agency ? suggestion.agency.name : undefined,
            ];
      case 'venue':
      case 'address':
      case 'street':
        return [
          suggestion.name,
          suggestion.label.replace(
            new RegExp(`${escapeRegExp(suggestion.name)}(,)?( )?`),
            '',
          ),
        ];
      case 'favouriteStop':
      case 'stop':
        return plain
          ? [
              suggestion.name ||
                suggestion.label ||
                (suggestion.address && suggestion.address.split(',')[0]),
              getLocality(suggestion),
            ]
          : [
              suggestion.name,
              suggestion.id,
              getStopCode(suggestion),
              getLocality(suggestion),
            ];
      case 'favouriteStation':
      case 'station':
      default:
        return [
          suggestion.name ||
            suggestion.label ||
            (suggestion.address && suggestion.address.split(',')[0]),
          getLocality(suggestion),
        ];
    }
  },
  (item, plain) => {
    const i = cloneDeep(item);
    i.plain = plain;
    return i;
  },
);

/**
 * Checks that features are unique by label
 *
 * @name uniqByLabel
 * @param {Array} features Array of features
 * @returns {Array}  Array of unique features
 * @example
 * digitransit-search-util.uniqByLabel(features);
 * //= Array(2)
 */
export default function uniqByLabel(features) {
  return uniqWith(features, (feat1, feat2) => {
    const bool =
      isEqual(getNameLabel(feat1.properties), getNameLabel(feat2.properties)) &&
      feat1.properties.layer === feat2.properties.layer;
    if (
      bool &&
      (feat1.type === 'FutureRoute' || feat2.type === 'FutureRoute')
    ) {
      return false;
    }
    return bool;
  });
}
