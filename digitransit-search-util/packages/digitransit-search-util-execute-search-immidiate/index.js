import debounce from 'lodash/debounce';
import flatten from 'lodash/flatten';
import take from 'lodash/take';
import { sortSearchResults } from '@digitransit-search-util/digitransit-search-util-helpers';
import uniqByLabel from '@digitransit-search-util/digitransit-search-util-uniq-by-label';
import filterMatchingToInput from '@digitransit-search-util/digitransit-search-util-filter-matching-to-input';
import getGeocodingResult from '@digitransit-search-util/digitransit-search-util-get-geocoding-results';

function getFavouriteLocations(favourites, input) {
  return Promise.resolve(
    filterMatchingToInput(favourites, input, ['address', 'name']).map(item => ({
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
function selectPositionFomMap(input) {
  if (typeof input !== 'string' || input.length === 0) {
    return Promise.resolve([
      {
        type: 'SelectFromMap',
        address: 'SelectFromMap',
        lat: null,
        lon: null,
        properties: {
          labelId: 'select-from-map',
          layer: 'selectFromMap',
          address: 'SelectFromMap',
          lat: null,
          lon: null,
        },
        geometry: {
          type: 'Point',
          coordinates: [],
        },
      },
    ]);
  }
  return Promise.resolve([]);
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

function selectFromOwnLocations(input) {
  if (typeof input !== 'string' || input.length === 0) {
    return Promise.resolve([
      {
        type: 'SelectFromOwnLocations',
        address: 'SelectFromOwnLocations',
        lat: null,
        lon: null,
        properties: {
          labelId: 'select-from-own-locations',
          layer: 'ownLocations',
          address: 'selectFromOwnLocations',
          lat: null,
          lon: null,
        },
        geometry: {
          type: 'Point',
          coordinates: [],
        },
      },
    ]);
  }
  return Promise.resolve([]);
}

function getBackSuggestion() {
  return Promise.resolve([
    {
      type: 'back',
      address: 'back',
      lat: null,
      lon: null,
      properties: {
        labelId: 'back',
        layer: 'back',
        address: 'back',
        lat: null,
        lon: null,
      },
      geometry: {
        type: 'Point',
        coordinates: [],
      },
    },
  ]);
}

function getFavouriteStops(stopsAndStations, input) {
  return stopsAndStations.then(stops => {
    return filterMatchingToInput(stops, input, [
      'properties.name',
      'properties.name',
      'properties.address',
    ]);
  });
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

function hasFavourites(context, locations, stops) {
  const favouriteLocations = locations(context);
  const favouriteStops = stops(context);
  return (
    (favouriteLocations && favouriteLocations.length > 0) ||
    (favouriteStops && favouriteStops.length > 0)
  );
}

const routeLayers = [
  'route-TRAM',
  'route-BUS',
  'route-RAIL',
  'route-FERRY',
  'route-SUBWAY',
];
const locationLayers = ['favouritePlace', 'venue', 'address', 'street'];
/**
 * Executes the search
 *
 */
export function getSearchResults(
  targets,
  sources,
  transportMode,
  searchContext,
  filterSearchResultsByMode,
  { input },
  callback,
) {
  const {
    getPositions,
    getFavouriteLocations: locations,
    getOldSearches: prevSearches,
    getFavouriteStops: stops,
    getLanguage,
    getStopAndStationsQuery,
    getFavouriteRoutesQuery,
    getFavouriteRoutes,
    getRoutesQuery,
    context,
    isPeliasLocationAware: locationAware,
    minimalRegexp,
    lineRegexp,
    URL_PELIAS,
    feedIDs,
    geocodingSearchParams,
    geocodingSources,
    getFutureRoutes,
  } = searchContext;
  // if no targets are provided, search them all.
  const allTargets = !targets || targets.length === 0;
  // if no sources are provided, use them all.
  const allSources = !sources || sources.length === 0;
  const position = getPositions(context);
  const searchComponents = [];
  const searches = { type: 'all', term: input, results: [] };
  const language = getLanguage(context);
  const focusPoint =
    locationAware && position.hasLocation
      ? {
          // Round coordinates to approx 1 km, in order to improve caching
          'focus.point.lat': position.lat.toFixed(2),
          'focus.point.lon': position.lon.toFixed(2),
        }
      : {};
  const nearYouMode = transportMode || undefined;
  if (
    targets.includes('CurrentPosition') &&
    position.status !== 'geolocation-not-supported'
  ) {
    searchComponents.push(getCurrentPositionIfEmpty(input, position));
  }
  if (allTargets || targets.includes('MapPosition')) {
    searchComponents.push(selectPositionFomMap(input));
  }
  if (targets.includes('FutureRoutes')) {
    const { items } = getFutureRoutes(context);
    searchComponents.push(take(items, 3));
  }
  if (
    targets.includes('SelectFromOwnLocations') &&
    hasFavourites(context, locations, stops)
  ) {
    searchComponents.push(selectFromOwnLocations(input));
  }
  if (allTargets || targets.includes('Locations')) {
    // eslint-disable-next-line prefer-destructuring
    const searchParams = geocodingSearchParams;
    if (allSources || sources.includes('Favourite')) {
      const favouriteLocations = locations(context);
      searchComponents.push(getFavouriteLocations(favouriteLocations, input));
      const favouriteStops = stops(context);
      const stopsAndStations = getStopAndStationsQuery(favouriteStops);
      searchComponents.push(getFavouriteStops(stopsAndStations, input));
      if (sources.includes('Back')) {
        searchComponents.push(getBackSuggestion());
      }
    }
    if (allSources || sources.includes('Datasource')) {
      const regex = minimalRegexp || undefined;
      const geocodingLayers = ['station', 'venue', 'address', 'street'];
      const geosources = geocodingSources.join(',');
      searchComponents.push(
        getGeocodingResult(
          input,
          searchParams,
          language,
          focusPoint,
          geosources,
          URL_PELIAS,
          regex,
          geocodingLayers,
        ),
      );
    }
    if (allSources || sources.includes('History')) {
      const locationHistory = prevSearches(context, 'endpoint');
      const dropLayers = [
        'currentPosition',
        'selectFromMap',
        'futureRoute',
        'ownLocations',
        'stop',
        'back',
      ];
      dropLayers.push(...routeLayers);
      searchComponents.push(getOldSearches(locationHistory, input, dropLayers));
    }
  }

  if (allTargets || targets.includes('Stops')) {
    if (allSources || sources.includes('Favourite')) {
      const favouriteStops = stops(context);
      const stopsAndStations = getStopAndStationsQuery(favouriteStops);
      searchComponents.push(getFavouriteStops(stopsAndStations, input));
    }
    if (allSources || sources.includes('Datasource')) {
      const regex = minimalRegexp || undefined;
      const geocodingLayers = ['stop', 'station'];
      const feedis = feedIDs.map(v => `gtfs${v}`).join(',');
      searchComponents.push(
        getGeocodingResult(
          input,
          undefined,
          language,
          focusPoint,
          feedis,
          URL_PELIAS,
          regex,
          geocodingLayers,
        ).then(results => {
          if (filterSearchResultsByMode) {
            return filterSearchResultsByMode(results);
          }
          return results;
        }),
      );
    }
    if (allSources || sources.includes('History')) {
      const stopHistory = prevSearches(context).filter(item => {
        if (item.properties.gid) {
          return item.properties.gid.includes('GTFS:');
        }
        return true;
      });
      const dropLayers = [
        'currentPosition',
        'selectFromMap',
        'futureRoute',
        'ownLocations',
        'favouritePlace',
        'back',
      ];
      dropLayers.push(...routeLayers);
      dropLayers.push(...locationLayers);
      if (nearYouMode) {
        searchComponents.push(
          getOldSearches(stopHistory, input, dropLayers).then(result =>
            filterSearchResultsByMode(result),
          ),
        );
      } else {
        searchComponents.push(getOldSearches(stopHistory, input, dropLayers));
      }
    }
  }

  if (allTargets || targets.includes('Routes')) {
    if (allSources || sources.includes('Favourite')) {
      const favouriteRoutes = getFavouriteRoutes(context);
      searchComponents.push(getFavouriteRoutesQuery(favouriteRoutes, input));
    }
    searchComponents.push(getRoutesQuery(input, feedIDs, nearYouMode));
    if (allSources || sources.includes('History')) {
      const routeHistory = prevSearches(context);
      const dropLayers = [
        'currentPosition',
        'selectFromMap',
        'futureRoute',
        'favouritePlace',
        'stop',
        'station',
        'ownLocations',
        'back',
      ];
      if (nearYouMode) {
        dropLayers.push(...routeLayers.filter(i => !(i === nearYouMode)));
      }
      dropLayers.push(...locationLayers);
      searchComponents.push(getOldSearches(routeHistory, input, dropLayers));
    }
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
      results: sortSearchResults(lineRegexp, searches.results, input),
    });
  });
}

const debouncedSearch = debounce(getSearchResults, 300, {
  leading: true,
});

export const executeSearch = (
  targets,
  sources,
  transportMode,
  searchContext,
  filterSearchResultsByMode,
  data,
  callback,
) => {
  callback(null); // This means 'we are searching'
  debouncedSearch(
    targets,
    sources,
    transportMode,
    searchContext,
    filterSearchResultsByMode,
    data,
    callback,
  );
};
