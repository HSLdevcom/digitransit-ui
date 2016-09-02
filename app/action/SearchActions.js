import debounce from 'lodash/debounce';
import sortBy from 'lodash/sortBy';
import uniqWith from 'lodash/uniqWith';
import orderBy from 'lodash/orderBy';
import take from 'lodash/take';
import get from 'lodash/get';
import flatten from 'lodash/flatten';
import XhrPromise from '../util/xhr-promise';
import config from '../config';
import { getLabel } from '../util/suggestionUtils';
import { getLatLng } from '../util/geo-utils';
import routeCompare from '../util/route-compare';

function processResults(actionContext, result) {
  actionContext.dispatch('SuggestionsResult', result);
}

export function saveSearch(actionContext, endpoint) {
  actionContext.dispatch('SaveSearch', endpoint);
}

export function closeSearch(actionContext) {
  actionContext.dispatch('CloseSearch');
}

const uniq = features =>
  uniqWith(features, (feat1, feat2) =>
    getLabel(feat1.properties) === getLabel(feat2.properties)
  );

function addCurrentPositionIfEmpty(input) {
  if (typeof input !== 'string' || input.length === 0) {
    return Promise.resolve([{
      type: 'CurrentLocation',
      properties: { labelId: 'own-position', layer: 'currentPosition' },
    }]);
  }

  return Promise.resolve([]);
}

function filterMatchingToInput(list, input, fields) {
  if ((typeof input === 'string' ? input.length : 0) > 0) {
    return list.filter(item => {
      const parts = fields.map(pName => get(item, pName));

      const test = parts.join(' ').toLowerCase();
      return test.indexOf(input.toLowerCase()) > -1;
    });
  }

  return list;
}

function addOldSearches(oldSearches, input) {
  const matchingOldSearches =
    filterMatchingToInput(oldSearches, input, ['address', 'locationName']);

  return Promise.resolve(take(matchingOldSearches, 10).map(item =>
    ({
      type: 'OldSearch',
      properties: {
        label: item.address,
        layer: 'oldSearch',
        mode: item.properties ? item.properties.mode : null },
      geometry: item.geometry,
    })
  ));
}

function addFavouriteLocations(favourites, input) {
  return Promise.resolve(
    orderBy(
      filterMatchingToInput(favourites, input, ['address', 'locationName']),
      feature => feature.locationName
    ).map(item =>
      ({
        type: 'Favourite',
        properties: { label: item.locationName, layer: 'favourite' },
        geometry: { type: 'Point', coordinates: [item.lon, item.lat] },
      })
  ));
}

function getGeocodingResult(input, geolocation, language) {
  let opts;

  if (input === undefined || input === null || input.trim().length < 3) {
    return Promise.resolve([]);
  }

  if (config.autoSuggest.locationAware && geolocation.hasLocation) {
    opts = Object.assign({ text: input }, config.searchParams, {
      'focus.point.lat': geolocation.lat,
      'focus.point.lon': geolocation.lon,
      lang: language,
    });
  } else {
    opts = Object.assign({ text: input }, config.searchParams, { lang: language });
  }

  return XhrPromise.getJson(config.URL.PELIAS, opts)
    .then(res => orderBy(res.features, feature => feature.properties.confidence, 'desc'));
}

function queryGraphQL(query, opts) {
  const payload = JSON.stringify({ query, variables: null });
  return XhrPromise.postJson(`${config.URL.OTP}index/graphql`, opts, payload);
}

function mapRoutes(res) {
  if (res) {
    return res.map(item =>
      ({
        type: 'Route',
        agency: item.agency,
        properties: {
          label: `${item.shortName} ${item.longName}`,
          layer: `route-${item.mode}`,
          mode: item.mode.toLowerCase(),
          shortName: item.shortName,
          longName: item.longName,
          link: `/linjat/${item.patterns[0].code}`,
        },
        geometry: {
          coordinates: [item.lat, item.lon],
        },
      })
    );
  }
  return [];
}

function compareRoutes(x, y) {
  return x.agency.name.localeCompare(y.agency.name) ||
    routeCompare(x.properties, y.properties);
}

function getStops(res) {
  if (res) {
    return res.map(item => {
      const mode = item.routes
              && item.routes.length > 0
              ? item.routes[0].mode.toLowerCase()
              : null;

      const stop = {
        type: 'Stop',

        properties: {
          code: item.code,
          label: item.name,
          mode,
          layer: 'stop',
          link: `/pysakit/${item.gtfsId}`,
        },

        geometry: {
          coordinates: [item.lon, item.lat],
        },
      };

      if (item.code) {
        stop.properties.label = `${stop.properties.label}, ${item.code}`;
      }

      return stop;
    });
  }
  return [];
}

function searchStops(input) {
  if (input === undefined || input === null || input.trim().length < 3) {
    return Promise.resolve([]);
  }

  return queryGraphQL(`{stops(name:"${input}") { gtfsId lat lon name code routes { mode }}}`)
    .then(response =>
      getStops(response && response.data && response.data.stops)
    );
}

function searchRoutesAndStops(input, reference, favourites) {
  let refLatLng;
  let isNumber;
  let doStopSearch;
  let doRouteSearch;
  const searches = [];

  const fav = favourites.map(f => `"${f}"`);

  searches.push(
    `favouriteRoutes:routes(ids:[${fav.join(',')}]) {
      patterns {code}
      agency {name}
      shortName
      mode
      longName
    }`
  );

  if (input !== undefined && input !== null && input.trim().length > 0) {
    doRouteSearch = doStopSearch = false;
    isNumber = input.match(/^\d+$/) !== null;

    if (isNumber) {
      const lnLen = input.match(/^\d+$/)[0].length;

      if (lnLen <= 3) {
        doRouteSearch = true;
      }

      if (lnLen === 4) {
        doStopSearch = true;
      }
    } else {
      doRouteSearch = doStopSearch = true;
    }
  }

  if (doRouteSearch) {
    searches.push(
      `routes(name:"${input}") {patterns {code} agency {name} shortName mode longName}`
    );
  }

  if (doStopSearch) {
    searches.push(`stops(name:"${input}") { gtfsId lat lon name code routes{ mode }}`);
  }

  if (searches.length > 0) {
    refLatLng = getLatLng(reference.lat, reference.lon);

    return queryGraphQL(`{${searches.join(' ')}}`).then(response => {
      if (response == null || response.data == null) {
        return [];
      }
      const favouriteRoutes = mapRoutes(response.data.favouriteRoutes).map(favourite =>
        Object.assign({}, favourite, {
          properties: Object.assign({}, favourite.properties, { layer: 'favourite' }),
          type: 'Favourite',
        })
      );
      return ([]
        .concat(favouriteRoutes.sort(compareRoutes))
        .concat(uniq(mapRoutes(response.data.routes)).sort(compareRoutes))
        .concat(sortBy(getStops(response.data.stops || []), (item) =>
          Math.round(
            getLatLng(item.geometry.coordinates[1], item.geometry.coordinates[0])
            .distanceTo(refLatLng) / 50000)
        )));
    });
  }
  return Promise.resolve([]);
}

function executeSearchInternal(actionContext, { input, type }) {
  processResults(actionContext, []);

  const position = actionContext.getStore('PositionStore').getLocationState();
  const language = actionContext.getStore('PreferencesStore').getLanguage();
  const origin = actionContext.getStore('EndpointStore').getOrigin();

  const positionCoords = position.hasLocation ? { lon: position.lon, lat: position.lat } :
    { lon: config.initialLocation.lon, lat: config.initialLocation.lat };

  const referenceLocation = origin.lat ? { lon: origin.lon, lat: origin.lat } : positionCoords;

  if (type === 'endpoint') {
    const favouriteLocations = actionContext.getStore('FavouriteLocationStore').getLocations();
    const oldSearches = actionContext.getStore('OldSearchesStore').getOldSearches('endpoint');

    const searches = [
      addCurrentPositionIfEmpty(input),
      addFavouriteLocations(favouriteLocations, input),
      addOldSearches(oldSearches, input),
    ];

    searches.push(getGeocodingResult(input, position, language));

    return Promise.all(searches)
    .then(flatten)
    .then(uniq)
    .then(suggestions => processResults(actionContext, suggestions))
    .catch(err => console.error(err)); // eslint-disable-line no-console
  }
  const favouriteRoutes = actionContext.getStore('FavouriteRoutesStore').getRoutes();

  return searchRoutesAndStops(input, referenceLocation, favouriteRoutes)
    .then(uniq)
    .then(suggestions =>
      take(filterMatchingToInput(suggestions, input, ['properties.label', 'properties.code']), 20))
    .then(suggestions => processResults(actionContext, suggestions))
    .catch(err => console.error(err)); // eslint-disable-line no-console
}

export const executeSearch = debounce(executeSearchInternal, 300);

export function openDialog(actionContext, tab) {
  return actionContext.dispatch('OpenDialog', tab);
}
