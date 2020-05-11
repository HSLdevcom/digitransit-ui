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
export function getSearchResults(
  searchTypeLayers,
  geocodingLayers,
  searchContext,
  refPoint,
  { input, config },
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
  const dropLayers = getDropLayers(geocodingLayers);
  const searchComponents = [];
  const searches = { type: 'all', term: input, results: [] };
  if (
    searchTypeLayers.includes('CurrentPosition') &&
    position.status !== 'geolocation-not-supported'
  ) {
    searchComponents.push(getCurrentPositionIfEmpty(input, position));
  }
  if (searchTypeLayers.includes('FavouritePlace')) {
    const favouriteLocations = locations(context);
    searchComponents.push(getFavouriteLocations(favouriteLocations, input));
  }
  if (searchTypeLayers.includes('FavouriteStop')) {
    const favouriteStops = stops(context);
    const stopsAndStations = getStopAndStations(favouriteStops);
    searchComponents.push(getFavouriteStops(stopsAndStations, input, refPoint));
  }
  if (searchTypeLayers.includes('OldSearch')) {
    const oldEndpointSearches = searchTypeLayers.includes('Route')
      ? prevSearches(context)
      : prevSearches(context, 'endpoint');
    dropLayers.push('currentPosition');
    // old searches should also obey the layers definition
    if (!searchTypeLayers.includes('FavouritePlace')) {
      dropLayers.push('favouritePlace');
    }
    searchComponents.push(
      getOldSearches(oldEndpointSearches, input, dropLayers),
    );
  }
  if (searchTypeLayers.includes('FavouriteRoutes')) {
    const favouriteRoutes = getStoredFavouriteRoutes(context);
    searchComponents.push(getFavouriteRoutes(favouriteRoutes, input));
  }
  if (searchTypeLayers.includes('Routes')) {
    searchComponents.push(getRoutes(input, config));
  }
  if (searchTypeLayers.includes('Geocoding')) {
    // eslint-disable-next-line prefer-destructuring
    let searchParams = config.searchParams;
    const language = getLanguage(context);
    const focusPoint =
      config.autoSuggest.locationAware && position.hasLocation
        ? {
            // Round coordinates to approx 1 km, in order to improve caching
            'focus.point.lat': position.lat.toFixed(2),
            'focus.point.lon': position.lon.toFixed(2),
          }
        : {};

    let sources = get(config, 'searchSources', '').join(',');
    if (searchTypeLayers.includes('Stops')) {
      searchParams = undefined;
      sources = sources.concat(',').concat(
        get(config, 'feedIds', [])
          .map(v => `gtfs${v}`)
          .join(','),
      );
    }
    const regex =
      config && config.search ? config.search.minimalRegexp : undefined;
    searchComponents.push(
      getGeocodingResult(
        input,
        searchParams,
        language,
        focusPoint,
        sources,
        config.URL.PELIAS,
        regex,
        geocodingLayers,
      ),
    );
  }
  const searchResultsPromise = Promise.all(searchComponents)
    .then(flatten)
    .then(uniqByLabel)
    .then(results => {
      searches.results = results;
    })
    .catch(err => {
      searches.error = err;
    });
  searchResultsPromise.then(() => {
    callback({
      ...searches,
      results: sortSearchResults(config, searches.results, input),
    });
  });
}

const debouncedSearch = debounce(getSearchResults, 300, {
  leading: true,
});

export const executeSearch = (
  searchTypeLayers,
  geocodingLayers,
  searchContext,
  refPoint,
  data,
  callback,
) => {
  callback(null); // This means 'we are searching'
  debouncedSearch(
    searchTypeLayers,
    geocodingLayers,
    searchContext,
    refPoint,
    data,
    callback,
  );
};
