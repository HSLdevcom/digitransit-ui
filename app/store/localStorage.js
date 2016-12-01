import { isBrowser } from '../util/browser';
function setItem(key, value) {
  if (isBrowser && window.localStorage) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.log('[localStorage]' + // eslint-disable-line no-console
          ' Unable to save state; localStorage is not available in Safari private mode');
      } else {
        throw error;
      }
    }
  }
}

function getItem(key) {
  return (isBrowser && window.localStorage &&
    window.localStorage.getItem(key)) || null;
}

function getItemAsJson(key, defaultValue) {
  let item = getItem(key);

  if (item == null) {
    item = defaultValue || '[]';
  }

  return JSON.parse(item);
}

export function removeItem(k) {
  if (isBrowser && window.localStorage) {
    window.localStorage.removeItem(k);
  }
}

export function getFavouriteLocationsStorage() {
  return getItemAsJson('favouriteLocations');
}

export function setFavouriteLocationsStorage(data) {
  setItem('favouriteLocations', data);
}

export function getFavouriteStopsStorage() {
  return getItemAsJson('favouriteStops');
}

export function setFavouriteStopsStorage(data) {
  setItem('favouriteStops', data);
}

export function getFavouriteCityBikeStations() {
  return getItemAsJson('favouriteCityBikeStations', '[]');
}

export function setFavouriteCityBikeStations(data) {
  setItem('favouriteCityBikeStations', data);
}

export function getFavouriteRoutesStorage() {
  return getItemAsJson('favouriteRoutes');
}

export function setFavouriteRoutesStorage(data) {
  setItem('favouriteRoutes', data);
}

export function getMessagesStorage() {
  return getItemAsJson('messages');
}

export function setMessagesStorage(data) {
  setItem('messages', data);
}

export function getModeStorage() {
  return getItemAsJson('mode', '{}');
}

export function setModeStorage(data) {
  setItem('mode', data);
}

export function getOldSearchesStorage() {
  return getItemAsJson('saved-searches');
}

export function setOldSearchesStorage(data) {
  setItem('saved-searches', data);
}

export function getFeedbackStorage() {
  return getItemAsJson('feedback');
}

export function setFeedbackStorage(data) {
  setItem('feedback', data);
}

export function setPositioningHasSucceeded(state) {
  setItem('positioningSuccesful', { state });
}

export function getPositioningHasSucceeded() {
  return getItemAsJson('positioningSuccesful', '{ "state": false }').state;
}

export function setHistory(history) {
  setItem('history', history);
}

export function getHistory() {
  return getItemAsJson('history', '["/"]');
}
