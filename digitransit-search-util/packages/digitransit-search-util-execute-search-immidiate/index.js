import orderBy from 'lodash/orderBy';
import debounce from 'lodash/debounce';
import flatten from 'lodash/flatten';
import sortBy from 'lodash/sortBy';
import distance from '@digitransit-search-util/digitransit-search-util-distance';
import take from 'lodash/take';
import get from 'lodash/get';
import { sortSearchResults } from '@digitransit-search-util/digitransit-search-util-helpers';
import uniqByLabel from '@digitransit-search-util/digitransit-search-util-uniq-by-label';
import filterMatchingToInput from '@digitransit-search-util/digitransit-search-util-filter-matching-to-input';
import getGeocodingResult from '@digitransit-search-util/digitransit-search-util-get-geocoding-results';

export const getAllEndpointLayers = [
  'CurrentPosition',
  'FavouritePlace',
  'FavouriteStop',
  'OldSearch',
  'Geocoding',
  'Stops',
];

/**
 * SearchType depicts the type of the search.
 */
const SearchType = {
  All: 'all',
  Endpoint: 'endpoint',
  Search: 'search',
};

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

function getFavouriteStops(stopsAndStations, input, origin) {
  const refLatLng = origin &&
    origin.lat &&
    origin.lon && { lat: origin.lat, lng: origin.lon };

  return stopsAndStations
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
function getDropLayers(layers) {
  const allLayers = ['street', 'address', 'venue', 'station', 'stop'];
  return allLayers.filter(l => !layers.includes(l));
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

/**
 * Executes the search
 *
 */
export function executeSearchImmediate(
  geocodingLayers,
  searchContext,
  refPoint,
  { input, type, layers, config },
  callback,
) {
  const {
    getPositions,
    getFavouriteLocations: locations,
    getOldSearches: prevSearches,
    getFavouriteStops: stops,
    getLanguage,
    getStopAndStations,
    getFavouriteRoutes,
    getStoredFavouriteRoutes,
    getRoutes,
    context,
  } = searchContext;
  const position = getPositions(context);
  const endpointSearches = { type: 'endpoint', term: input, results: [] };
  const searchSearches = { type: 'search', term: input, results: [] };
  let endpointSearchesPromise;
  let searchSearchesPromise;
  const endpointLayers = layers || getAllEndpointLayers();
  const dropLayers = getDropLayers(geocodingLayers);
  if (type === SearchType.Endpoint || type === SearchType.All) {
    const favouriteLocations = locations(context);
    const oldEndpointSearches = prevSearches(context, 'endpoint');
    const favouriteStops = stops(context);
    const language = getLanguage(context);
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
      const stopsAndStations = getStopAndStations(favouriteStops);
      searchComponents.push(
        getFavouriteStops(stopsAndStations, input, refPoint),
      );
    }
    if (endpointLayers.includes('OldSearch')) {
      dropLayers.push('currentPosition');
      // old searches should also obey the layers definition
      if (!endpointLayers.includes('FavouritePlace')) {
        dropLayers.push('favouritePlace');
      }
      searchComponents.push(
        getOldSearches(oldEndpointSearches, input, dropLayers),
      );
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
      const regex =
        config && config.search ? config.search.minimalRegexp : undefined;
      searchComponents.push(
        getGeocodingResult(
          input,
          config.searchParams,
          language,
          focusPoint,
          sources,
          config.URL.PELIAS,
          regex,
          geocodingLayers,
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
        const regex =
          config && config.search ? config.search.minimalRegexp : undefined;
        searchComponents.push(
          getGeocodingResult(
            input,
            undefined,
            language,
            focusPoint,
            sources,
            config.URL.PELIAS,
            regex,
            geocodingLayers,
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
    const searchComponents = [];
    const oldSearches = prevSearches(context);
    const favouriteRoutes = getStoredFavouriteRoutes(context);
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
      const regex =
        config && config.search ? config.search.minimalRegexp : undefined;
      searchComponents.push(
        getGeocodingResult(
          input,
          undefined,
          'fi',
          focusPoint,
          sources,
          config.URL.PELIAS,
          regex,
          geocodingLayers,
        ),
      );
    }

    searchComponents.push(
      getFavouriteRoutes(favouriteRoutes, input),
      getOldSearches(oldSearches, input, dropLayers),
      getRoutes(input, config),
    );
    searchSearchesPromise = Promise.all(searchComponents)
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

export const executeSearch = (
  geocodingLayers,
  searchContext,
  refPoint,
  data,
  callback,
) => {
  callback(null); // This means 'we are searching'
  debouncedSearch(geocodingLayers, searchContext, refPoint, data, callback);
};
