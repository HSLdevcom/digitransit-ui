import Relay from 'react-relay/classic';

import get from 'lodash/get';
import take from 'lodash/take';
import orderBy from 'lodash/orderBy';
import sortBy from 'lodash/sortBy';
import debounce from 'lodash/debounce';
import flatten from 'lodash/flatten';
import { getJson } from './xhrPromise';
import routeCompare from './route-compare';
import { distance } from './geo-utils';
import { uniqByLabel } from './suggestionUtils';
import mapPeliasModality from './pelias-to-modality-mapper';
import { PREFIX_ROUTES } from '../util/path';

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

const mapRoute = item => ({
  type: 'Route',
  properties: {
    ...item,
    layer: `route-${item.mode}`,
    link: `/${PREFIX_ROUTES}/${item.gtfsId}/pysakit/${item.patterns[0].code}`,
  },
  geometry: {
    coordinates: null,
  },
});

function sortByDistance(stops, refLatLng) {
  if (refLatLng.lat && refLatLng.lng) {
    return sortBy(stops, item =>
      distance(refLatLng, {
        lat: item.lat,
        lng: item.lon,
      }),
    );
  }
  return stops;
}

function filterMatchingToInput(list, Input, fields) {
  if (typeof Input === 'string' && Input.length > 0) {
    const input = Input.toLowerCase().trim();

    return list.filter(item => {
      let parts = [];
      fields.forEach(pName => {
        let value = get(item, pName);

        if ((pName === 'properties.label' || pName === 'address') && value) {
          // special case: drop last part i.e. city, because it is too coarse match target
          value = value.split(',');
          if (value.length > 1) {
            value.splice(value.length - 1, 1);
          }
          value = value.join();
        }
        if (value) {
          parts = parts.concat(
            value
              .toLowerCase()
              .replace(/,/g, ' ')
              .split(' '),
          );
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
      },
    ]);
  }

  return Promise.resolve([]);
}

function getOldSearches(oldSearches, input, dropLayers) {
  let matchingOldSearches = filterMatchingToInput(oldSearches, input, [
    'properties.name',
    'properties.label',
    'properties.shortName',
    'properties.longName',
    'properties.desc',
  ]);

  if (dropLayers) {
    // don't want these
    matchingOldSearches = matchingOldSearches.filter(
      item => !dropLayers.includes(item.properties.layer),
    );
  }

  return Promise.resolve(
    take(matchingOldSearches, 10).map(item => ({
      ...item,
      type: 'OldSearch',
      timetableClicked: false, // reset latest selection action
    })),
  );
}

function getFavouriteLocations(favourites, input) {
  return Promise.resolve(
    orderBy(
      filterMatchingToInput(favourites, input, ['address', 'locationName']),
      feature => feature.locationName,
    ).map(item => ({
      type: 'FavouritePlace',
      properties: {
        ...item,
        label: item.locationName,
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

  return getJson(config.URL.PELIAS, opts)
    .then(res =>
      orderBy(res.features, feature => feature.properties.confidence, 'desc'),
    )
    .then(features => mapPeliasModality(features, config));
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
      routes.sort((x, y) => routeCompare(x.properties, y.properties)),
    );
}

function getFavouriteStops(favourites, input, origin) {
  const refLatLng = origin &&
    origin.lat &&
    origin.lon && { lat: origin.lat, lng: origin.lon };

  const stops = sortByDistance(favourites, refLatLng);

  return Promise.resolve(
    filterMatchingToInput(stops, input, [
      'properties.locationName',
      'properties.address',
    ]).map(stop => ({
      type: 'FavouriteStop',
      properties: {
        ...stop,
        layer: 'favouriteStop',
      },
      geometry: {
        coordinates: [stop.lon, stop.lat],
      },
    })),
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
    query routes($name: String) {
      viewer {
        routes(name: $name ) {
          gtfsId
          agency {name}
          shortName
          mode
          longName
          patterns { code }
        }
      }
    }`,
    { name: input },
  );

  return getRelayQuery(query)
    .then(data =>
      data[0].routes
        .filter(
          item =>
            config.feedIds === undefined ||
            config.feedIds.indexOf(item.gtfsId.split(':')[0]) > -1,
        )
        .map(mapRoute)
        .sort((x, y) => routeCompare(x.properties, y.properties)),
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

export function executeSearchImmediate(
  getStore,
  refPoint,
  { input, type, layers, config },
  callback,
) {
  const position = getStore('PositionStore').getLocationState();
  let endpointSearches;
  let searchSearches;
  let endpointSearchesPromise;
  let searchSearchesPromise;
  const endpointLayers = layers || getAllEndpointLayers();

  if (type === 'endpoint' || type === 'all') {
    endpointSearches = { type: 'endpoint', term: input, results: [] };
    const favouriteLocations = getStore(
      'FavouriteLocationStore',
    ).getLocations();
    const oldSearches = getStore('OldSearchesStore').getOldSearches('endpoint');
    const favouriteStops = getStore('FavouriteStopsStore').getStops();
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

    if (type === 'endpoint') {
      endpointSearchesPromise.then(() => callback([endpointSearches]));
      return;
    }
  }

  if (type === 'search' || type === 'all') {
    searchSearches = { type: 'search', term: input, results: [] };
    const oldSearches = getStore('OldSearchesStore').getOldSearches('search');
    const favouriteRoutes = getStore('FavouriteRoutesStore').getRoutes();

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
        callback([searchSearches]);
      });
      return;
    }
  }

  Promise.all([endpointSearchesPromise, searchSearchesPromise]).then(() =>
    callback([searchSearches, endpointSearches]),
  );
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
