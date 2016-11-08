import debounce from 'lodash/debounce';
import flatten from 'lodash/flatten';
import { uniqByLabel } from '../util/suggestionUtils';
import {
  getCurrentPositionIfEmpty,
  getFavouriteLocations,
  getOldSearches,
  getGeocodingResult,
  getFavouriteRoutes,
  getRoutes,
  getStops,
} from '../util/searchUtils';

function processResults(actionContext, result) {
  actionContext.dispatch('SuggestionsResult', result);
}

export function saveSearch(actionContext, endpoint) {
  actionContext.dispatch('SaveSearch', endpoint);
}

function executeSearchInternal(actionContext, { input, type }) {
  processResults(actionContext, []);
  const position = actionContext.getStore('PositionStore').getLocationState();
  const searches = [];

  if (type === 'endpoint' || type === 'all') {
    const favouriteLocations = actionContext.getStore('FavouriteLocationStore').getLocations();
    const oldSearches = actionContext.getStore('OldSearchesStore').getOldSearches('endpoint');
    const language = actionContext.getStore('PreferencesStore').getLanguage();

    searches.push(getCurrentPositionIfEmpty(input));
    searches.push(getFavouriteLocations(favouriteLocations, input));
    searches.push(getOldSearches(oldSearches, input));
    searches.push(getGeocodingResult(input, position, language));
  }

  if (type === 'search' || type === 'all') {
    const origin = actionContext.getStore('EndpointStore').getOrigin();
    const location = origin.lat ? origin : position;
    const favouriteRoutes = actionContext.getStore('FavouriteRoutesStore').getRoutes();

    searches.push(getFavouriteRoutes(favouriteRoutes, input));
    searches.push(getRoutes(input));
    searches.push(getStops(input, location));
  }


  return Promise.all(searches)
    .then(flatten)
    .then(uniqByLabel)
    .then(suggestions => processResults(actionContext, suggestions))
    .catch(err => console.error(err)); // eslint-disable-line no-console
}

export const executeSearch = debounce(executeSearchInternal, 300);

export function openDialog(actionContext, tab) {
  return actionContext.dispatch('OpenDialog', tab);
}
