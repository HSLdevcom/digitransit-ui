import uniqWith from 'lodash/uniqWith';
import isEqual from 'lodash/isEqual';
import memoize from 'lodash/memoize';
import escapeRegExp from 'lodash/escapeRegExp';
import cloneDeep from 'lodash/cloneDeep';

const getLocality = suggestion =>
  suggestion.localadmin || suggestion.locality || '';

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
        return [
          suggestion.name,
          suggestion.address.replace(
            new RegExp(`${escapeRegExp(suggestion.name)}(,)?( )?`),
            '',
          ),
        ];
      case 'favouriteBikeRentalStation':
      case 'bikeRentalStation':
        return [suggestion.name, 'bike-rental-station'];
      case 'favouriteRoute':
      case 'route-BUS':
      case 'route-TRAM':
      case 'route-RAIL':
      case 'route-SUBWAY':
      case 'route-FERRY':
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
        return [
          suggestion.name,
          suggestion.label.replace(
            new RegExp(`${escapeRegExp(suggestion.name)}(,)?( )?`),
            '',
          ),
        ];
      case 'favouriteStation':
      case 'favouriteStop':
        return [
          suggestion.name,
          suggestion.id,
          suggestion.address.replace(
            new RegExp(`${escapeRegExp(suggestion.name)}(,)?( )?`),
            '',
          ),
        ];

      case 'stop':
        return plain
          ? [suggestion.name || suggestion.label, getLocality(suggestion)]
          : [
              suggestion.name,
              suggestion.id,
              getStopCode(suggestion),
              getLocality(suggestion),
            ];
      case 'station':
      default:
        return [suggestion.name || suggestion.label, getLocality(suggestion)];
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
