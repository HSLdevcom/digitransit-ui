import { isBrowser, isWindowsPhone, isIOSApp } from '../util/browser';

function handleSecurityError(error, logMessage) {
  if (error.name === 'SecurityError') {
    if (logMessage) {
      console.log(logMessage); // eslint-disable-line no-console
    }
  } else {
    throw error;
  }
}

function setItem(key, value) {
  if (isBrowser && window.localStorage) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.log('[localStorage]' + // eslint-disable-line no-console
          ' Unable to save state; localStorage is not available in Safari private mode');
      } else {
        handleSecurityError(error, '[localStorage]' +
          ' Unable to save state; access to localStorage denied by browser settings');
      }
    }
  }
}

function getItem(key) {
  if (isBrowser && window.localStorage) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      handleSecurityError(error);
    }
  }
  return null;
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
    try {
      window.localStorage.removeItem(k);
    } catch (error) {
      handleSecurityError(error);
    }
  }
}

export function getCustomizedSettings() {
  return getItemAsJson('customizedSettings');
}

export function setCustomizedSettings(data) {
  // Get old settings and test if set values have changed
  const oldSettings = getCustomizedSettings();
  const newSettings = {
    accessibilityOption: !(typeof data.accessibilityOption === 'undefined') ? data.accessibilityOption
    : oldSettings.accessibilityOption,
    minTransferTime: data.minTransferTime ? data.minTransferTime
    : oldSettings.minTransferTime,
    modes: data.modes ? data.modes
    : oldSettings.modes,
    walkBoardCost: data.walkBoardCost ? data.walkBoardCost
    : oldSettings.walkBoardCost,
    walkReluctance: data.walkReluctance ? data.walkReluctance
    : oldSettings.walkReluctance,
    walkSpeed: data.walkSpeed ? data.walkSpeed
    : oldSettings.walkSpeed,
  };
  setItem('customizedSettings', newSettings);
}

export function resetCustomizedSettings() {
  localStorage.removeItem('customizedSettings');
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
  return getItemAsJson('saved-searches', '{"items": []}');
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

export function getIntroShown() {
  return getItemAsJson('intro') === true;
}

export function setIntroShown() {
  setItem('intro', true);
}

export function setPositioningHasSucceeded(state) {
  setItem('positioningSuccesful', { state });
}

export function getPositioningHasSucceeded(shouldCheckBrowser) {
  // Hack for Windows phone and iOS fullscreen apps
  if (shouldCheckBrowser && !(isWindowsPhone || isIOSApp)) {
    return false;
  }
  return getItemAsJson('positioningSuccesful', '{ "state": false }').state;
}

export function setHistory(history) {
  setItem('history', history);
}

export function getHistory() {
  return getItemAsJson('history', '{"entries":["/"], "index":0, "time":0}');
}
