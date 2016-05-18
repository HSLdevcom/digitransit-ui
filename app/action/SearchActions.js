import XhrPromise from '../util/xhr-promise';
import config from '../config';
import debounce from 'lodash/debounce';
import sortBy from 'lodash/sortBy';
import uniqWith from 'lodash/uniqWith';
import orderBy from 'lodash/orderBy';
import take from 'lodash/take';
import get from 'lodash/get';
import SuggestionUtils from '../util/suggestion-utils';
import geoUtils from '../util/geo-utils';

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
    SuggestionUtils.getLabel(feat1.properties) === SuggestionUtils.getLabel(feat2.properties)
  );

function addCurrentPositionIfEmpty(features) {
  if (features.length === 0) {
    features.push({
      type: 'CurrentLocation',
      properties: { labelId: 'own-position', layer: 'currentPosition' },
    });
  }

  return features;
}

function filterMatchingToInput(list, input, fields) {
  if ((typeof input === 'string' ? input.length : 0) >= 0) {
    return list.filter(item => {
      const parts = fields.map(pName => get(item, pName));

      const test = parts.join(' ').toLowerCase();
      return test.indexOf(input.toLowerCase()) > -1;
    });
  }

  return list;
}

function addOldSearches(oldSearches, features, input) {
  const matchingOldSearches =
    filterMatchingToInput(oldSearches, input, ['address', 'locationName']);

  const results = take(matchingOldSearches, 10).map(item =>
    ({
      type: 'OldSearch',
      properties: { label: item.address, layer: 'oldSearch' },
      geometry: item.geometry,
    })
  );

  return features.concat(results);
}

function addFavouriteLocations(favourites, features, input) {
  const results =
    orderBy(
      filterMatchingToInput(favourites, input, ['address', 'locationName']),
      feature => feature.locationName
    ).map(item =>
      ({
        type: 'Favourite',
        properties: { label: item.locationName, layer: 'favourite' },
        geometry: { type: 'Point', coordinates: [item.lon, item.lat] },
      })
  );

  return features.concat(results);
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

  return XhrPromise.getJson(config.URL.PELIAS, opts).then(res => res.features);
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
          layer: `route-${item.type}`,
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

function getStops(res) {
  if (res) {
    return res.map(item => {
      const stop = {
        type: 'Stop',

        properties: {
          code: item.code,
          label: item.name,
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

  return queryGraphQL(`{stops(name:"${input}") {gtfsId lat lon name code}}`)
    .then(response =>
      getStops(response != null && response.data != null ? response.data.stops : void 0)
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
      type
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
      `routes(name:"${input}") {patterns {code} agency {name} shortName type longName}`
    );
  }

  if (doStopSearch) {
    searches.push(`stops(name:"${input}") {gtfsId lat lon name code}`);
  }

  if (searches.length > 0) {
    refLatLng = geoUtils.getLatLng(reference.lat, reference.lon);

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
        .concat(sortBy(favouriteRoutes, () => ['agency.name', 'properties.label']))
        .concat(sortBy(mapRoutes(response.data.routes), () => ['agency.name', 'properties.label']))
        .concat(sortBy(getStops(response.data.stops || []), (item) =>
          Math.round(
            geoUtils.getLatLng(item.geometry.coordinates[1], item.geometry.coordinates[0])
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

    // TODO: Make old searches and favourites come on top
    return Promise.all([
      getGeocodingResult(input, position, language),
      searchStops(input),
    ])
    .then(result => result[0].concat(result[1]))
    .then(addCurrentPositionIfEmpty)
    .then(suggestions => addFavouriteLocations(favouriteLocations, suggestions, input))
    .then(suggestions => addOldSearches(oldSearches, suggestions, input))
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
