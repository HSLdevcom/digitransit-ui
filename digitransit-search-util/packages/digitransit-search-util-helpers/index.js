import isString from 'lodash/isString';
import orderBy from 'lodash/orderBy';
import uniqWith from 'lodash/uniqWith';
import isDuplicate from '@digitransit-search-util/digitransit-search-util-is-duplicate';

const normalize = str => {
  if (!isString(str)) {
    return '';
  }
  return str.toLowerCase();
};

/**
 * LayerType depicts the type of the point-of-interest.
 */
const LayerType = {
  Address: 'address',
  CurrentPosition: 'currentPosition',
  FavouriteStop: 'favouriteStop',
  FavouriteStation: 'favouriteStation',
  FavouritePlace: 'favouritePlace',
  Station: 'station',
  Stop: 'stop',
  Street: 'street',
  Venue: 'venue',
};
const PREFIX_ROUTES = 'linjat';

export const mapRoute = item => {
  if (item === null || item === undefined) {
    return null;
  }

  const link = `/${PREFIX_ROUTES}/${item.gtfsId}/pysakit/${
    orderBy(item.patterns, 'code', ['asc'])[0].code
  }`;

  return {
    type: 'Route',
    properties: {
      ...item,
      layer: `route-${item.mode}`,
      link,
    },
    geometry: {
      coordinates: null,
    },
  };
};

/**
 * Tries to match the given search term agains the collection of properties
 * for a geocoding result. The best match will be returned (min: 0, max: 1.5).
 *
 * @param {string} normalizedTerm the normalized search term.
 * @param {*} resultProperties the geocoding result's property collection.
 */
export const match = (normalizedTerm, resultProperties) => {
  if (!isString(normalizedTerm) || normalizedTerm.length === 0) {
    return 0;
  }

  const matchProps = ['name', 'label', 'address', 'shortName'];
  return matchProps
    .map(name => resultProperties[name])
    .filter(value => isString(value) && value.length > 0)
    .map(value => {
      const normalizedValue = normalize(value);
      if (normalizedValue.indexOf(normalizedTerm) === 0) {
        // full match at start. Return max result when match is full, not only partial
        return 0.5 + normalizedTerm.length / normalizedValue.length;
      }
      // because of filtermatchingtoinput, we know that match occurred somewhere
      // don't run filtermatching again but estimate roughly:
      // the longer the matching string, the better confidence, max being 0.5
      return 0.5 * normalizedTerm.length / (normalizedTerm.length + 1);
    })
    .reduce(
      (previous, current) => (current > previous ? current : previous),
      0,
    );
};

/**
 * Ranks the result based on its layer property.
 *
 * @param {string} layer the layer property.
 * @param {string} source the source property.
 */
export const getLayerRank = (layer, source) => {
  switch (layer) {
    case LayerType.CurrentPosition:
      return 1;
    case LayerType.FavouriteStation:
      return 0.45;
    case LayerType.Station: {
      if (isString(source) && source.indexOf('gtfs') === 0) {
        return 0.44;
      }
      return 0.43;
    }
    case LayerType.FavouritePlace:
      return 0.42;
    case LayerType.FavouriteStop:
      return 0.41;
    default:
      // venue, address, street, route-xxx
      return 0.4;
    case LayerType.Stop:
      return 0.35;
  }
};

/**
 * Helper function to sort the results. Orders as follows:
 *  - current position first for an empty search
 *  - matching routes first
 *  - otherwise by confidence, except that:
 *    - boost well matching stations (especially from GTFS)
 *    - rank stops lower as they tend to occupy most of the search results
 *  - items with no confidence (old searches and favorites):
 *    - rank favourites better than ordinary old searches
 *    - rank full match better than partial match
 *    - rank match at middle word lower than match at the beginning
 * @param {*[]} results The search results that were received
 * @param {String} term The search term that was used
 */
export const sortSearchResults = (lineRegexp, results, term = '') => {
  if (!Array.isArray(results)) {
    return results;
  }

  const isLineIdentifier = value =>
    isString(value) && lineRegexp && lineRegexp.test(value);

  const normalizedTerm = normalize(term);
  const isLineSearch = isLineIdentifier(normalizedTerm);

  const orderedResults = orderBy(
    results,
    [
      // rank matching routes best
      result =>
        isLineSearch &&
        isLineIdentifier(normalize(result.properties.shortName)) &&
        normalize(result.properties.shortName).indexOf(normalizedTerm) === 0
          ? 1
          : 0,

      result => {
        const { confidence, layer, source } = result.properties;
        if (normalizedTerm.length === 0) {
          // Doing search with empty string.
          // No confidence to match, so use ranked old searches and favourites
          return getLayerRank(layer, source);
        }

        // must handle a mixup of geocoder searches and items above
        // Normal confidence range from geocoder is about 0.3 .. 1
        if (!confidence) {
          // not from geocoder, estimate confidence ourselves
          return (
            getLayerRank(layer, source) +
            match(normalizedTerm, result.properties)
          );
        }

        // geocoded items with confidence, just adjust a little
        switch (layer) {
          case LayerType.Station: {
            const boost = source.indexOf('gtfs') === 0 ? 0.05 : 0.01;
            return Math.min(confidence + boost, 1);
          }
          default:
            return confidence;
          case LayerType.Stop:
            return confidence - 0.1;
        }
      },
    ],
    ['desc', 'desc'],
  );

  return uniqWith(orderedResults, isDuplicate);
};
