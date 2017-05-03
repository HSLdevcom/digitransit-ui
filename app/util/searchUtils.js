import Relay from 'react-relay';

import get from 'lodash/get';
import take from 'lodash/take';
import orderBy from 'lodash/orderBy';
import sortBy from 'lodash/sortBy';
import debounce from 'lodash/debounce';
import flatten from 'lodash/flatten';

import { getJson } from './xhrPromise';
import routeCompare from './route-compare';
import { getLatLng } from './geo-utils';
import { uniqByLabel } from './suggestionUtils';
import mapPeliasModality from './pelias-to-modality-mapper';

function getRelayQuery(query) {
  return new Promise((resolve, reject) => {
    const callback = (readyState) => {
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
    link: `/linjat/${item.gtfsId}/pysakit/${item.patterns[0].code}`,
  },
  geometry: {
    coordinates: null,
  },
});

function mapStops(stops) {
  return stops.map(item => ({
    type: 'Stop',
    properties: {
      ...item,
      mode: item.routes.length > 0 && item.routes[0].mode.toLowerCase(),
      layer: 'stop',
      link: `/pysakit/${item.gtfsId}`,
    },
    geometry: {
      coordinates: [item.lon, item.lat],
    },
  }));
}


function filterMatchingToInput(list, Input, fields) {
  if (typeof Input === 'string' && Input.length > 0) {
    const input = Input.toLowerCase().trim();

    return list.filter((item) => {
      let parts = [];
      fields.forEach((pName) => {
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
          parts = parts.concat(value.toLowerCase().replace(/,/g, ' ').split(' '));
        }
      });
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].indexOf(input) === 0) { // accept match only at word start
          return true;
        }
      }
      return false;
    });
  }

  return list;
}


function getCurrentPositionIfEmpty(input) {
  if (typeof input !== 'string' || input.length === 0) {
    return Promise.resolve([{
      type: 'CurrentLocation',
      properties: { labelId: 'own-position', layer: 'currentPosition' },
    }]);
  }

  return Promise.resolve([]);
}

function getOldSearches(oldSearches, input, dropLayers) {
  let matchingOldSearches =
    filterMatchingToInput(oldSearches, input, [
      'properties.name',
      'properties.label',
      'properties.shortName',
      'properties.longName',
      'properties.desc',
    ]);

  if (dropLayers) { // don't want these
    matchingOldSearches = matchingOldSearches.filter(
      item => (!dropLayers.includes(item.properties.layer)),
    );
  }

  return Promise.resolve(
    take(matchingOldSearches, 10).map(item => ({
      ...item,
      type: 'OldSearch',
    })),
  );
}

function getFavouriteLocations(favourites, input) {
  return Promise.resolve(
    orderBy(
      filterMatchingToInput(favourites, input, ['address', 'locationName']),
      feature => feature.locationName,
    ).map(item =>
      ({
        type: 'FavouritePlace',
        properties: { ...item, label: item.locationName, layer: 'favouritePlace' },
        geometry: { type: 'Point', coordinates: [item.lon, item.lat] },
      }),
  ));
}

export function getGeocodingResult(input, geolocation, language, config) {
  // TODO: minimum length should be in config
  if (input === undefined || input === null || input.trim().length < 3) {
    return Promise.resolve([]);
  }

  const focusPoint = (config.autoSuggest.locationAware && geolocation.hasLocation) ? {
    // Round coordinates to approx 1 km, in order to improve caching
    'focus.point.lat': geolocation.lat.toFixed(2), 'focus.point.lon': geolocation.lon.toFixed(2),
  } : {};

  const opts = { text: input, ...config.searchParams, ...focusPoint, lang: language };

  return getJson(config.URL.PELIAS, opts)
    .then(res => orderBy(res.features, feature => feature.properties.confidence, 'desc'))
    .then(features => mapPeliasModality(features, config));
}

function getFavouriteRoutes(favourites, input) {
  const query = Relay.createQuery(Relay.QL`
    query favouriteRoutes($ids: [String!]!) {
      routes(ids: $ids ) {
        gtfsId
        agency { name }
        shortName
        mode
        longName
        patterns { code }
      }
    }`, { ids: favourites },
  );

  return getRelayQuery(query)
    .then(favouriteRoutes => favouriteRoutes.map(mapRoute))
    .then(routes => routes.map(favourite => ({
      ...favourite,
      properties: { ...favourite.properties, layer: 'favouriteRoute' },
      type: 'FavouriteRoute',
    })))
    .then(routes => filterMatchingToInput(
      routes, input, ['properties.shortName', 'properties.longName']),
    )
    .then(routes => routes.sort((x, y) => routeCompare(x.properties, y.properties)));
}

function getFavouriteStops(favourites, input, origin) {
  const query = Relay.createQuery(Relay.QL`
    query favouriteStops($ids: [String!]!) {
      stops(ids: $ids ) {
        gtfsId
        lat
        lon
        name
        desc
        code
        routes { mode }
      }
    }`, { ids: favourites },
  );

  const refLatLng = origin.lat && origin.lon && getLatLng(origin.lat, origin.lon);

  return getRelayQuery(query)
    .then(favouriteStops => mapStops(favouriteStops).map(favourite => ({
      ...favourite,
      properties: { ...favourite.properties, layer: 'favouriteStop' },
      type: 'FavouriteStop',
    })))
    .then(stops => filterMatchingToInput(stops, input, ['properties.name', 'properties.desc']))
    .then(stops => (
      refLatLng ?
      sortBy(stops, item =>
        getLatLng(item.geometry.coordinates[1], item.geometry.coordinates[0]).distanceTo(refLatLng),
      ) : stops
  ));
}


function getRoutes(input, config) {
  if (typeof input !== 'string' || input.trim().length === 0) {
    return Promise.resolve([]);
  }
  const number = input.match(/^\d+$/);
  if (number && number[0].length > 3) {
    return Promise.resolve([]);
  }

  const query = Relay.createQuery(Relay.QL`
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
    }`, { name: input },
  );

  return getRelayQuery(query).then(data =>
    data[0].routes.filter(item => (
      config.feedIds === undefined || config.feedIds.indexOf(item.gtfsId.split(':')[0]) > -1
    ))
    .map(mapRoute)
    .sort((x, y) => routeCompare(x.properties, y.properties)),
  ).then(suggestions => take(suggestions, 10));
}

function getStops(input, origin, config) {
  if (typeof input !== 'string' || input.trim().length === 0 || config.search.usePeliasStops) {
    return Promise.resolve([]);
  }
  const number = input.match(/^\d+$/);
  if (number && number[0].length !== 4) {
    return Promise.resolve([]);
  }

  const query = Relay.createQuery(Relay.QL`
    query stops($name: String) {
      viewer {
        stops(name: $name ) {
          gtfsId
          lat
          lon
          name
          desc
          code
          routes { mode }
        }
      }
    }`, { name: input },
  );

  const refLatLng = origin.lat && origin.lon && getLatLng(origin.lat, origin.lon);

  return getRelayQuery(query).then(data => mapStops(data[0].stops)).then(stops => (
    refLatLng ?
    sortBy(stops, item =>
      Math.round(
        getLatLng(item.geometry.coordinates[1], item.geometry.coordinates[0])
        .distanceTo(refLatLng) / 50000), // divide in 50km buckets
    ) : stops
  )).then(suggestions => take(suggestions, 10));
}

export const getAllEndpointLayers = () => (
  ['CurrentPosition', 'FavouritePlace', 'OldSearch', 'Geocoding']
);


export function executeSearchImmediate(getStore, { input, type, layers, config }, callback) {
  const position = getStore('PositionStore').getLocationState();
  let endpointSearches;
  let searchSearches;
  let endpointSearchesPromise;
  let searchSearchesPromise;
  const endpointLayers = layers || getAllEndpointLayers();

  if (type === 'endpoint' || type === 'all') {
    endpointSearches = { type: 'endpoint', term: input, results: [] };
    const favouriteLocations = getStore('FavouriteLocationStore').getLocations();
    const oldSearches = getStore('OldSearchesStore').getOldSearches('endpoint');
    const language = getStore('PreferencesStore').getLanguage();
    const searchComponents = [];

    if (endpointLayers.includes('CurrentPosition') && position.hasLocation) {
      searchComponents.push(getCurrentPositionIfEmpty(input));
    }
    if (endpointLayers.includes('FavouritePlace')) {
      searchComponents.push(getFavouriteLocations(favouriteLocations, input));
    }
    if (endpointLayers.includes('OldSearch')) {
      let dropLayers;
      // old searches should also obey the layers definition
      if (!endpointLayers.includes('FavouritePlace')) {
        dropLayers = ['favouritePlace'];
      }
      searchComponents.push(getOldSearches(oldSearches, input, dropLayers));
    }
    if (endpointLayers.includes('Geocoding')) {
      searchComponents.push(getGeocodingResult(input, position, language, config));
    }

    endpointSearchesPromise = Promise.all(searchComponents)
      .then(flatten)
      .then(uniqByLabel)
      .then((results) => { endpointSearches.results = results; })
      .catch((err) => { endpointSearches.error = err; });

    if (type === 'endpoint') {
      endpointSearchesPromise.then(() => callback([endpointSearches]));
      return;
    }
  }

  if (type === 'search' || type === 'all') {
    searchSearches = { type: 'search', term: input, results: [] };
    const origin = getStore('EndpointStore').getOrigin();
    const location = origin.lat ? origin : position;
    const oldSearches = getStore('OldSearchesStore').getOldSearches('search');
    const favouriteRoutes = getStore('FavouriteRoutesStore').getRoutes();
    const favouriteStops = getStore('FavouriteStopsStore').getStops();

    searchSearchesPromise = Promise.all([
      getFavouriteRoutes(favouriteRoutes, input),
      getFavouriteStops(favouriteStops, input, origin),
      getOldSearches(oldSearches, input),
      getRoutes(input, config),
      getStops(input, location, config),
    ])
    .then(flatten)
    .then(uniqByLabel)
    .then((results) => { searchSearches.results = results; })
    .catch((err) => { searchSearches.error = err; });

    if (type === 'search') {
      searchSearchesPromise.then(() => { callback([searchSearches]); });
      return;
    }
  }

  Promise.all([endpointSearchesPromise, searchSearchesPromise])
    .then(() => callback([searchSearches, endpointSearches]));
}

const debouncedSearch = debounce(executeSearchImmediate, 300);

export const executeSearch = (getStore, data, callback) => {
  callback(null); // This means 'we are searching'
  debouncedSearch(getStore, data, callback);
};


export const withCurrentTime = (getStore, location) => {
  const query = (location && location.query) || {};

  return {
    ...location,
    query: {
      ...query,
      time: query.time ? query.time : getStore('TimeStore').getCurrentTime().unix(),
    },
  };
};
