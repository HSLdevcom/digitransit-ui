import debounce from 'lodash/debounce';
import flatten from 'lodash/flatten';
import take from 'lodash/take';
import {
  sortSearchResults,
  isStop,
} from '@digitransit-search-util/digitransit-search-util-helpers';
import uniqByLabel from '@digitransit-search-util/digitransit-search-util-uniq-by-label';
import filterMatchingToInput from '@digitransit-search-util/digitransit-search-util-filter-matching-to-input';
import getGeocodingResults from '@digitransit-search-util/digitransit-search-util-get-geocoding-results';
import getJson from '@digitransit-search-util/digitransit-search-util-get-json';

function getStopsFromGeocoding(stops, URL_PELIAS_PLACE) {
  if (!stops || stops.length < 1) {
    return Promise.resolve([]);
  }
  let gids = '';
  const stopsWithGids = stops.map(stop => {
    const type = stop.type === 'stop' ? 'stop' : 'station';
    let gid = `gtfs${stop.gtfsId.split(':')[0].toLowerCase()}:${type}:GTFS:${
      stop.gtfsId
    }`;
    if (stop.code) {
      gid += `#${stop.code}`;
    }
    gids += `${gid},`;
    return { ...stop, gid };
  });
  const stopStationMap = stopsWithGids.reduce(function (map, stopOrStation) {
    // eslint-disable-next-line no-param-reassign
    map[stopOrStation.gid] = stopOrStation;
    return map;
  }, {});
  return getJson(URL_PELIAS_PLACE, {
    ids: gids.slice(0, -1),
    // lang: context.getStore('PreferencesStore').getLanguage(), TODO enable this when OTP supports translations
  }).then(res => {
    return res.features.map(stop => {
      const favourite = {
        type: 'FavouriteStop',
        properties: {
          gid: stopStationMap[stop.properties.gid].gid,
          code: stopStationMap[stop.properties.gid].code,
          gtfsId: stopStationMap[stop.properties.gid].gtfsId,
          lastUpdated: stopStationMap[stop.properties.gid].lastUpdated,
          favouriteId: stopStationMap[stop.properties.gid].favouriteId,
          address: stop.properties.label,
          layer: isStop(stop.properties) ? 'favouriteStop' : 'favouriteStation',
        },
        geometry: stop.geometry,
      };
      return favourite;
    });
  });
}
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
        arrowClicked: false,
      };
      delete newItem.properties.confidence;
      return newItem;
    }),
  );
}

function hasFavourites(context, locations, stops) {
  const favouriteLocations = locations(context);
  if (favouriteLocations && favouriteLocations.length > 0) {
    return true;
  }
  const favouriteStops = stops(context);
  return favouriteStops && favouriteStops.length > 0;
}

const routeLayers = [
  'route-TRAM',
  'route-BUS',
  'route-RAIL',
  'route-FERRY',
  'route-SUBWAY',
  'route-AIRPLANE',
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
  filterResults,
  geocodingSize,
  { input },
  callback,
  pathOpts,
  refPoint,
) {
  const {
    getPositions,
    getFavouriteLocations: locations,
    getOldSearches: prevSearches,
    getFavouriteStops: stops,
    getLanguage,
    getStopAndStationsQuery,
    getFavouriteBikeRentalStationsQuery,
    getFavouriteBikeRentalStations,
    getFavouriteRoutesQuery,
    getFavouriteRoutes,
    getRoutesQuery,
    context,
    isPeliasLocationAware: locationAware,
    minimalRegexp,
    lineRegexp,
    URL_PELIAS,
    URL_PELIAS_PLACE,
    feedIDs,
    geocodingSearchParams,
    geocodingSources,
    getFutureRoutes,
    cityBikeNetworks,
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
    locationAware && refPoint?.lat && refPoint?.lon
      ? {
          // Round coordinates to approx 1 km, in order to improve caching
          'focus.point.lat': refPoint.lat.toFixed(3),
          'focus.point.lon': refPoint.lon.toFixed(3),
        }
      : {};
  const mode = transportMode ? transportMode.split('-')[1] : undefined;
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
    const items = getFutureRoutes(context);
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
    if (sources.includes('Favourite')) {
      const favouriteLocations = locations(context);
      searchComponents.push(getFavouriteLocations(favouriteLocations, input));
      if (sources.includes('Back')) {
        searchComponents.push(getBackSuggestion());
      }
    }
    if (allSources || sources.includes('Datasource')) {
      const geocodingLayers = ['station', 'venue', 'address', 'street'];
      const feedis = feedIDs.map(v => `gtfs${v}`);
      const geosources = geocodingSources.concat(feedis).join(',');
      searchComponents.push(
        getGeocodingResults(
          input,
          searchParams,
          language,
          focusPoint,
          geosources,
          URL_PELIAS,
          minimalRegexp,
          geocodingLayers,
          refPoint,
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
        'bikeRentalStation',
        'stop',
        'back',
      ];
      dropLayers.push(...routeLayers);
      searchComponents.push(getOldSearches(locationHistory, input, dropLayers));
    }
  }

  if (allTargets || targets.includes('Stops')) {
    if (sources.includes('Favourite')) {
      const favouriteStops = stops(context);
      let stopsAndStations;
      if (favouriteStops.every(stop => stop.type === 'station')) {
        stopsAndStations = getStopsFromGeocoding(
          favouriteStops,
          URL_PELIAS_PLACE,
        ).then(results => {
          if (filterResults) {
            return filterResults(results, mode);
          }
          return results;
        });
      } else {
        stopsAndStations = getStopAndStationsQuery(favouriteStops)
          .then(favourites =>
            getStopsFromGeocoding(favourites, URL_PELIAS_PLACE),
          )
          .then(results => {
            if (filterResults) {
              return filterResults(results, mode);
            }
            return results;
          });
      }
      searchComponents.push(getFavouriteStops(stopsAndStations, input));
    }
    if (allSources || sources.includes('Datasource')) {
      const geocodingLayers = ['stop', 'station'];
      const searchParams = {
        size: geocodingSize,
      };
      const feedis = feedIDs.map(v => `gtfs${v}`).join(',');
      searchComponents.push(
        getGeocodingResults(
          input,
          searchParams,
          language,
          focusPoint,
          feedis,
          URL_PELIAS,
          minimalRegexp,
          geocodingLayers,
        ).then(results => {
          if (filterResults) {
            return filterResults(results, mode);
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
        'bikeRentalStation',
        'back',
      ];
      dropLayers.push(...routeLayers);
      dropLayers.push(...locationLayers);
      if (transportMode) {
        if (transportMode !== 'route-CITYBIKE') {
          dropLayers.push('bikeRentalStation');
          dropLayers.push('bikestation');
        }
        searchComponents.push(
          getOldSearches(stopHistory, input, dropLayers).then(result =>
            filterResults ? filterResults(result, mode) : result,
          ),
        );
      } else {
        searchComponents.push(getOldSearches(stopHistory, input, dropLayers));
      }
    }
  }

  if (allTargets || targets.includes('Routes')) {
    if (sources.includes('Favourite')) {
      const favouriteRoutes = getFavouriteRoutes(context);
      searchComponents.push(
        getFavouriteRoutesQuery(
          favouriteRoutes,
          input,
          mode,
          pathOpts,
        ).then(result =>
          filterResults ? filterResults(result, mode, 'Routes') : result,
        ),
      );
    }
    searchComponents.push(
      getRoutesQuery(input, feedIDs, transportMode, pathOpts).then(result =>
        filterResults ? filterResults(result, mode, 'Routes') : result,
      ),
    );
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
      if (transportMode) {
        if (transportMode !== 'route-CITYBIKE') {
          dropLayers.push('bikeRentalStation');
          dropLayers.push('bikestation');
        }
        dropLayers.push(...routeLayers.filter(i => !(i === transportMode)));
      }
      dropLayers.push(...locationLayers);
      searchComponents.push(
        getOldSearches(routeHistory, input, dropLayers).then(results =>
          filterResults ? filterResults(results, mode, 'Routes') : results,
        ),
      );
    }
  }
  if (allTargets || targets.includes('BikeRentalStations')) {
    if (sources.includes('Favourite')) {
      const favouriteRoutes = getFavouriteBikeRentalStations(context);
      searchComponents.push(
        getFavouriteBikeRentalStationsQuery(favouriteRoutes, input),
      );
    }
    if (allSources || sources.includes('Datasource')) {
      const geocodingLayers = ['bikestation'];
      const searchParams = {
        size: geocodingSize,
      };
      searchComponents.push(
        getGeocodingResults(
          input,
          searchParams,
          language,
          focusPoint,
          cityBikeNetworks.join(','),
          URL_PELIAS,
          minimalRegexp,
          geocodingLayers,
        ).then(results => {
          if (filterResults) {
            return filterResults(results, mode, 'BikeRentalStations');
          }
          return results;
        }),
      );
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
  filterResults,
  geocodingSize,
  data,
  callback,
  pathOpts,
  refPoint,
) => {
  callback(null); // This means 'we are searching'
  debouncedSearch(
    targets,
    sources,
    transportMode,
    searchContext,
    filterResults,
    geocodingSize,
    data,
    callback,
    pathOpts,
    refPoint,
  );
};
