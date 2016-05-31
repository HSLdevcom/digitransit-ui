function setItem(key, value) {
  if (typeof window !== 'undefined' && window.localStorage) {
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
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(key);
  }
  return void 0;
}

function getItemAsJson(key) {
  let item = getItem(key);

  if (item == null) {
    item = '[]';
  }

  return JSON.parse(item);
}

export function removeItem(k) {
  if (typeof window !== 'undefined' && window.localStorage) {
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

export function getFavouriteRoutesStorage() {
  return getItemAsJson('favouriteRoutes');
}

export function setFavouriteRoutesStorage(data) {
  setItem('favouriteRoutes', data);
}

export function getModeStorage() {
  return getItemAsJson('mode');
}

export function setModeStorage(data) {
  setItem('mode', data);
}

export function getPreferencesStorage() {
  return getItemAsJson('userPreferences');
}

export function setPreferencesStorage(data) {
  setItem('userPreferences', data);
}

export function getOldSearchesStorage() {
  return getItemAsJson('saved-searches');
}

export function setOldSearchesStorage(data) {
  setItem('saved-searches', data);
}
