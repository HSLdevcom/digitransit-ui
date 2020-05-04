import Relay from 'react-relay/classic';
import get from 'lodash/get';
import isString from 'lodash/isString';
import take from 'lodash/take';
import orderBy from 'lodash/orderBy';
import sortBy from 'lodash/sortBy';
import debounce from 'lodash/debounce';
import flatten from 'lodash/flatten';
import merge from 'lodash/merge';
import uniqWith from 'lodash/uniqWith';

import { getJson } from './xhrPromise';
import { distance } from './geo-utils';
import { uniqByLabel, isStop } from './suggestionUtils';
import mapPeliasModality from './pelias-to-modality-mapper';
import { PREFIX_ROUTES, PREFIX_STOPS } from './path';

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

/**
 * SearchType depicts the type of the search.
 */
const SearchType = {
  All: 'all',
  Endpoint: 'endpoint',
  Search: 'search',
};

function getRelayQuery(query) {
  return new Promise((resolve, reject) => {
    const callback = readyState => {
      if (readyState.error) {
        reject(readyState.error);
      } else if (readyState.done) {
        resolve(Relay.Store.readQuery(query));
      }
    };

    Relay.Store.primeCache({ query }, callback);
  });
}

export const tryGetRelayQuery = async (query, defaultValue) => {
  try {
    return getRelayQuery(query) || defaultValue;
  } catch {
    return defaultValue;
  }
};

const mapRoute = item => {
  if (item === null || item === undefined) {
    return null;
  }

  const link = `/${PREFIX_ROUTES}/${item.gtfsId}/${PREFIX_STOPS}/${
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

export function routeNameCompare(a, b) {
  const a1 =
    a.shortName ||
    a.longName ||
    (a.agency && a.agency.name ? a.agency.name : '');
  const b1 =
    b.shortName ||
    b.longName ||
    (b.agency && b.agency.name ? b.agency.name : '');

  const aNum = parseInt(a1, 10);
  const bNum = parseInt(b1, 10);

  if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
    if (aNum < bNum) {
      return -1;
    }
    if (aNum > bNum) {
      return 1;
    }
  }

  const primary = a1.localeCompare(b1);
  if (primary !== 0) {
    return primary;
  }

  const a2 = a.longName || (a.agency && a.agency.name ? a.agency.name : '');
  const b2 = b.longName || (b.agency && b.agency.name ? b.agency.name : '');

  const secondary = a2.localeCompare(b2);
  if (secondary !== 0) {
    return secondary;
  }

  const a3 = a.agency && a.agency.name ? a.agency.name : '';
  const b3 = b.agency && b.agency.name ? b.agency.name : '';

  return a3.localeCompare(b3);
}

function truEq(val1, val2) {
  // accept equality of non nullish values
  return val1 && val2 && val1 === val2;
}

export function isDuplicate(item1, item2) {
  const props1 = item1.properties;
  const props2 = item2.properties;

  if (truEq(props1.gtfsId, props2.gtfsId)) {
    return true;
  }
  if (props1.gtfsId && props2.gid && props2.gid.includes(props1.gtfsId)) {
    return true;
  }
  if (props2.gtfsId && props1.gid && props1.gid.includes(props2.gtfsId)) {
    return true;
  }

  const p1 = item1.geometry.coordinates;
  const p2 = item2.geometry.coordinates;

  if (p1 && p2) {
    // both have geometry
    if (Math.abs(p1[0] - p2[0]) < 1e-6 && Math.abs(p1[1] - p2[1]) < 1e-6) {
      // location match is not enough. Require a common property
      if (
        truEq(props1.name, props2.name) ||
        truEq(props1.label, props2.label) ||
        truEq(props1.address, props2.address) ||
        truEq(props1.address, props2.label) ||
        truEq(props1.label, props2.address)
      ) {
        return true;
      }
    }
  }
  return false;
}

function filterMatchingToInput(list, Input, fields) {
  if (typeof Input === 'string' && Input.length > 0) {
    const input = Input.toLowerCase().trim();
    const multiWord = input.includes(' ') || input.includes(',');

    return list.filter(item => {
      let parts = [];
      fields.forEach(pName => {
        let value = get(item, pName);

        if (
          !multiWord &&
          (pName === 'properties.label' || pName === 'address') &&
          value
        ) {
          // special case: drop last parts i.e. city and neighbourhood
          value = value.split(',');
          if (value.length > 2) {
            value.splice(value.length - 2, 2);
          } else if (value.length > 1) {
            value.splice(value.length - 1, 1);
          }
          value = value.join(',');
        }
        if (value) {
          if (multiWord) {
            parts = parts.concat(value.toLowerCase());
          } else {
            parts = parts.concat(
              value
                .toLowerCase()
                .replace(/,/g, ' ')
                .split(' '),
            );
          }
        }
      });
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].indexOf(input) === 0) {
          // accept match only at word start
          return true;
        }
      }
      return false;
    });
  }

  return list;
}

function getCurrentPositionIfEmpty(input, position) {
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

function getOldSearches(oldSearches, input, dropLayers) {
  let matchingOldSearches = filterMatchingToInput(oldSearches, input, [
    'properties.name',
    'properties.label',
    'properties.address',
    'properties.shortName',
    'properties.longName',
  ]);

  if (dropLayers) {
    // don't want these
    matchingOldSearches = matchingOldSearches.filter(
      item => !dropLayers.includes(item.properties.layer),
    );
  }

  return Promise.resolve(
    take(matchingOldSearches, 10).map(item => {
      const newItem = {
        ...item,
        type: 'OldSearch',
        timetableClicked: false, // reset latest selection action
      };
      delete newItem.properties.confidence;
      return newItem;
    }),
  );
}

function getFavouriteLocations(favourites, input) {
  return Promise.resolve(
    orderBy(
      filterMatchingToInput(favourites, input, ['address', 'name']),
      feature => feature.name,
    ).map(item => ({
      type: 'FavouritePlace',
      properties: {
        ...item,
        label: item.name,
        layer: 'favouritePlace',
      },
      geometry: { type: 'Point', coordinates: [item.lon, item.lat] },
    })),
  );
}

export function getGeocodingResult(
  _text,
  searchParams,
  lang,
  focusPoint,
  sources,
  config,
) {
  const text = _text ? _text.trim() : null;
  if (
    text === undefined ||
    text === null ||
    text.length < 1 ||
    (config.search &&
      config.search.minimalRegexp &&
      !config.search.minimalRegexp.test(text))
  ) {
    return Promise.resolve([]);
  }

  let opts = { text, ...searchParams, ...focusPoint, lang };
  if (sources) {
    opts = { ...opts, sources };
  }

  return getJson(config.URL.PELIAS, opts).then(response =>
    mapPeliasModality(response.features, config),
  );
}

function getFavouriteRoutes(favourites, input) {
  const query = Relay.createQuery(
    Relay.QL`
    query favouriteRoutes($ids: [String!]!) {
      routes(ids: $ids ) {
        gtfsId
        agency { name }
        shortName
        mode
        longName
        patterns { code }
      }
    }`,
    { ids: favourites },
  );
  return getRelayQuery(query)
    .then(favouriteRoutes => favouriteRoutes.map(mapRoute))
    .then(routes => routes.filter(route => !!route))
    .then(routes =>
      routes.map(favourite => ({
        ...favourite,
        properties: { ...favourite.properties, layer: 'favouriteRoute' },
        type: 'FavouriteRoute',
      })),
    )
    .then(routes =>
      filterMatchingToInput(routes, input, [
        'properties.shortName',
        'properties.longName',
      ]),
    )
    .then(routes =>
      routes.sort((x, y) => routeNameCompare(x.properties, y.properties)),
    );
}

function getFavouriteStops(favourites, input, origin) {
  // Currently we're updating only stops as there isn't suitable query for stations
  const stopQuery = Relay.createQuery(
    Relay.QL`
    query favouriteStops($ids: [String!]!) {
      stops(ids: $ids ) {
        gtfsId
        lat
        lon
        name
        code
      }
    }`,
    { ids: favourites.map(item => item.gtfsId) },
  );

  const stationQuery = Relay.createQuery(
    Relay.QL`
    query favouriteStations($ids: [String!]!) {
      stations(ids: $ids ) {
        gtfsId
        lat
        lon
        name
      }
    }`,
    { ids: favourites.map(item => item.gtfsId) },
  );

  const refLatLng = origin &&
    origin.lat &&
    origin.lon && { lat: origin.lat, lng: origin.lon };

  return getRelayQuery(stopQuery)
    .then(stops =>
      getRelayQuery(stationQuery).then(stations =>
        merge(stops, stations, favourites).map(stop => ({
          type: 'FavouriteStop',
          properties: {
            ...stop,
            label: stop.name,
            layer: isStop(stop) ? 'favouriteStop' : 'favouriteStation',
          },
          geometry: {
            coordinates: [stop.lon, stop.lat],
          },
        })),
      ),
    )
    .then(stops =>
      filterMatchingToInput(stops, input, [
        'properties.name',
        'properties.name',
        'properties.address',
      ]),
    )
    .then(
      stops =>
        refLatLng
          ? sortBy(stops, stop =>
              distance(refLatLng, {
                lat: stop.lat,
                lon: stop.lon,
              }),
            )
          : stops,
    );
}

function getRoutes(input, config) {
  if (typeof input !== 'string' || input.trim().length === 0) {
    return Promise.resolve([]);
  }
  const number = input.match(/^\d+$/);
  if (number && number[0].length > 3) {
    return Promise.resolve([]);
  }

  const query = Relay.createQuery(
    Relay.QL`
    query routes($feeds: [String!]!, $name: String) {
      viewer {
        routes(feeds: $feeds, name: $name ) {
          gtfsId
          agency {name}
          shortName
          mode
          longName
          patterns { 
            code
          }
        }
      }
    }`,
    {
      feeds:
        Array.isArray(config.feedIds) && config.feedIds.length > 0
          ? config.feedIds
          : null,
      name: input,
    },
  );

  return getRelayQuery(query)
    .then(data =>
      data[0].routes
        .map(mapRoute)
        .filter(route => !!route)
        .sort((x, y) => routeNameCompare(x.properties, y.properties)),
    )
    .then(suggestions => take(suggestions, 10));
}

export const getAllEndpointLayers = () => [
  'CurrentPosition',
  'FavouritePlace',
  'FavouriteStop',
  'OldSearch',
  'Geocoding',
  'Stops',
];

const normalize = str => {
  if (!isString(str)) {
    return '';
  }
  return str.toLowerCase();
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
export const sortSearchResults = (config, results, term = '') => {
  if (!Array.isArray(results)) {
    return results;
  }

  const isLineIdentifier = value =>
    isString(value) &&
    config.search &&
    config.search.lineRegexp &&
    config.search.lineRegexp.test(value);

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

export function executeSearchImmediate(
  getStore,
  refPoint,
  { input, type, layers, config },
  callback,
) {
  const position = getStore('PositionStore').getLocationState();
  const endpointSearches = { type: 'endpoint', term: input, results: [] };
  const searchSearches = { type: 'search', term: input, results: [] };

  let endpointSearchesPromise;
  let searchSearchesPromise;
  const endpointLayers = layers || getAllEndpointLayers();

  if (type === SearchType.Endpoint || type === SearchType.All) {
    const favouriteLocations = getStore('FavouriteStore').getLocations();
    const oldSearches = getStore('OldSearchesStore').getOldSearches('endpoint');
    const favouriteStops = getStore('FavouriteStore').getStopsAndStations();
    const language = getStore('PreferencesStore').getLanguage();
    const searchComponents = [];

    if (
      endpointLayers.includes('CurrentPosition') &&
      position.status !== 'geolocation-not-supported'
    ) {
      searchComponents.push(getCurrentPositionIfEmpty(input, position));
    }
    if (endpointLayers.includes('FavouritePlace')) {
      searchComponents.push(getFavouriteLocations(favouriteLocations, input));
    }
    if (endpointLayers.includes('FavouriteStop')) {
      searchComponents.push(getFavouriteStops(favouriteStops, input, refPoint));
    }
    if (endpointLayers.includes('OldSearch')) {
      const dropLayers = ['currentPosition'];
      // old searches should also obey the layers definition
      if (!endpointLayers.includes('FavouritePlace')) {
        dropLayers.push('favouritePlace');
      }
      searchComponents.push(getOldSearches(oldSearches, input, dropLayers));
    }

    if (endpointLayers.includes('Geocoding')) {
      const focusPoint =
        config.autoSuggest.locationAware && position.hasLocation
          ? {
              // Round coordinates to approx 1 km, in order to improve caching
              'focus.point.lat': position.lat.toFixed(2),
              'focus.point.lon': position.lon.toFixed(2),
            }
          : {};

      const sources = get(config, 'searchSources', '').join(',');

      searchComponents.push(
        getGeocodingResult(
          input,
          config.searchParams,
          language,
          focusPoint,
          sources,
          config,
        ),
      );
    }

    if (endpointLayers.includes('Stops')) {
      const focusPoint =
        config.autoSuggest.locationAware && position.hasLocation
          ? {
              // Round coordinates to approx 1 km, in order to improve caching
              'focus.point.lat': position.lat.toFixed(2),
              'focus.point.lon': position.lon.toFixed(2),
            }
          : {};
      const sources = get(config, 'feedIds', [])
        .map(v => `gtfs${v}`)
        .join(',');

      if (sources) {
        searchComponents.push(
          getGeocodingResult(
            input,
            undefined,
            language,
            focusPoint,
            sources,
            config,
          ),
        );
      }
    }

    endpointSearchesPromise = Promise.all(searchComponents)
      .then(resultsArray => {
        if (
          endpointLayers.includes('Stops') &&
          endpointLayers.includes('Geocoding')
        ) {
          // sort & combine pelias results into single array
          const modifiedResultsArray = [];
          for (let i = 0; i < resultsArray.length - 2; i++) {
            modifiedResultsArray.push(resultsArray[i]);
          }
          const sorted = orderBy(
            resultsArray[resultsArray.length - 1].concat(
              resultsArray[resultsArray.length - 2],
            ),
            [u => u.properties.confidence],
            ['desc'],
          );
          modifiedResultsArray.push(sorted);
          return modifiedResultsArray;
        }
        return resultsArray;
      })
      .then(flatten)
      .then(uniqByLabel)
      .then(results => {
        endpointSearches.results = results;
      })
      .catch(err => {
        endpointSearches.error = err;
      });

    if (type === SearchType.Endpoint) {
      endpointSearchesPromise.then(() =>
        callback({
          ...endpointSearches,
          results: sortSearchResults(config, endpointSearches.results, input),
        }),
      );
      return;
    }
  }

  if (type === SearchType.Search || type === SearchType.All) {
    const oldSearches = getStore('OldSearchesStore').getOldSearches('search');
    const favouriteRoutes = getStore('FavouriteStore').getRoutes();
    searchSearchesPromise = Promise.all([
      getFavouriteRoutes(favouriteRoutes, input),
      getOldSearches(oldSearches, input),
      getRoutes(input, config),
    ])
      .then(flatten)
      .then(uniqByLabel)
      .then(results => {
        searchSearches.results = results;
      })
      .catch(err => {
        searchSearches.error = err;
      });

    if (type === 'search') {
      searchSearchesPromise.then(() => {
        callback({
          ...searchSearches,
          results: sortSearchResults(config, searchSearches.results, input),
        });
      });
      return;
    }
  }

  Promise.all([endpointSearchesPromise, searchSearchesPromise]).then(() => {
    const results = [];
    if (endpointSearches && Array.isArray(endpointSearches.results)) {
      results.push(...endpointSearches.results);
    }
    if (searchSearches && Array.isArray(searchSearches.results)) {
      results.push(...searchSearches.results);
    }
    callback({
      results: sortSearchResults(config, results, input),
    });
  });
}

const debouncedSearch = debounce(executeSearchImmediate, 300, {
  leading: true,
});

export const executeSearch = (getStore, refPoint, data, callback) => {
  callback(null); // This means 'we are searching'
  debouncedSearch(getStore, refPoint, data, callback);
};

export const withCurrentTime = (getStore, location) => {
  const query = (location && location.query) || {};

  return {
    ...location,
    query: {
      ...query,
      time: query.time
        ? query.time
        : getStore('TimeStore')
            .getCurrentTime()
            .unix(),
    },
  };
};
