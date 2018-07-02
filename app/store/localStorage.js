import { isBrowser, isWindowsPhone, isIOSApp } from '../util/browser';

const getLocalStorage = runningInBrowser =>
  runningInBrowser ? window.localStorage : global.localStorage;

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
  const localStorage = getLocalStorage(isBrowser);
  if (localStorage) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.log(
          '[localStorage]' + // eslint-disable-line no-console
            ' Unable to save state; localStorage is not available in Safari private mode',
        );
      } else {
        handleSecurityError(
          error,
          '[localStorage]' +
            ' Unable to save state; access to localStorage denied by browser settings',
        );
      }
    }
  }
}

function getItem(key) {
  const localStorage = getLocalStorage(isBrowser);
  if (localStorage) {
    try {
      return localStorage.getItem(key);
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
  const localStorage = getLocalStorage(isBrowser);
  if (localStorage) {
    try {
      localStorage.removeItem(k);
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
    accessibilityOption: !(typeof data.accessibilityOption === 'undefined')
      ? data.accessibilityOption
      : oldSettings.accessibilityOption,
    minTransferTime: data.minTransferTime
      ? data.minTransferTime
      : oldSettings.minTransferTime,
    modes: data.modes ? data.modes : oldSettings.modes,
    walkBoardCost: data.walkBoardCost
      ? data.walkBoardCost
      : oldSettings.walkBoardCost,
    walkReluctance: data.walkReluctance
      ? data.walkReluctance
      : oldSettings.walkReluctance,
    walkSpeed: data.walkSpeed ? data.walkSpeed : oldSettings.walkSpeed,
    ticketTypes: data.ticketTypes ? data.ticketTypes : oldSettings.ticketTypes,
    transferPenalty: data.transferPenalty
      ? data.transferPenalty
      : oldSettings.transferPenalty,
  };
  setItem('customizedSettings', newSettings);
}

export function resetCustomizedSettings() {
  const localStorage = getLocalStorage(isBrowser);
  if (localStorage) {
    localStorage.removeItem('customizedSettings');
  }
}

// Get advanced routing parameters (not for normal use)
export function getRoutingSettings() {
  return getItemAsJson('routingSettings');
}

export function setRoutingSettings(data) {
  // Get old settings and test if set values have changed
  const oldSettings = getRoutingSettings();
  const newSettings = {
    maxWalkDistance: data.maxWalkDistance
      ? data.maxWalkDistance
      : oldSettings.maxWalkDistance,
    maxBikingDistance: data.maxBikingDistance
      ? data.maxBikingDistance
      : oldSettings.maxBikingDistance,
    ignoreRealtimeUpdates: data.ignoreRealtimeUpdates
      ? data.ignoreRealtimeUpdates
      : oldSettings.ignoreRealtimeUpdates,
    maxPreTransitTime: data.maxPreTransitTime
      ? data.maxPreTransitTime
      : oldSettings.maxPreTransitTime,
    walkOnStreetReluctance: data.walkOnStreetReluctance
      ? data.walkOnStreetReluctance
      : oldSettings.walkOnStreetReluctance,
    waitReluctance: data.waitReluctance
      ? data.waitReluctance
      : oldSettings.waitReluctance,
    bikeSpeed: data.bikeSpeed ? data.bikeSpeed : oldSettings.bikeSpeed,
    bikeSwitchTime: data.bikeSwitchTime
      ? data.bikeSwitchTime
      : oldSettings.bikeSwitchTime,
    bikeSwitchCost: data.bikeSwitchCost
      ? data.bikeSwitchCost
      : oldSettings.bikeSwitchCost,
    bikeBoardCost: data.bikeBoardCost
      ? data.bikeBoardCost
      : oldSettings.bikeBoardCost,
    optimize: data.optimize ? data.optimize : oldSettings.optimize,
    safetyFactor: data.safetyFactor
      ? data.safetyFactor
      : oldSettings.safetyFactor,
    slopeFactor: data.slopeFactor ? data.slopeFactor : oldSettings.slopeFactor,
    timeFactor: data.timeFactor ? data.timeFactor : oldSettings.timeFactor,
    carParkCarLegWeight: data.carParkCarLegWeight
      ? data.carParkCarLegWeight
      : oldSettings.carParkCarLegWeight,
    maxTransfers: data.maxTransfers
      ? data.maxTransfers
      : oldSettings.maxTransfers,
    waitAtBeginningFactor: data.waitAtBeginningFactor
      ? data.waitAtBeginningFactor
      : oldSettings.waitAtBeginningFactor,
    heuristicStepsPerMainStep: data.heuristicStepsPerMainStep
      ? data.heuristicStepsPerMainStep
      : oldSettings.heuristicStepsPerMainStep,
    compactLegsByReversedSearch: data.compactLegsByReversedSearch
      ? data.compactLegsByReversedSearch
      : oldSettings.compactLegsByReversedSearch,
    disableRemainingWeightHeuristic: data.disableRemainingWeightHeuristic
      ? data.disableRemainingWeightHeuristic
      : oldSettings.disableRemainingWeightHeuristic,
    itineraryFiltering: data.itineraryFiltering
      ? data.itineraryFiltering
      : oldSettings.itineraryFiltering,
    busWeight: data.busWeight ? data.busWeight : oldSettings.busWeight,
    railWeight: data.railWeight ? data.railWeight : oldSettings.railWeight,
    subwayWeight: data.subwayWeight
      ? data.subwayWeight
      : oldSettings.subwayWeight,
    tramWeight: data.tramWeight ? data.tramWeight : oldSettings.tramWeight,
    ferryWeight: data.ferryWeight ? data.ferryWeight : oldSettings.ferryWeight,
    airplaneWeight: data.airplaneWeight
      ? data.airplaneWeight
      : oldSettings.airplaneWeight,
  };
  setItem('routingSettings', newSettings);
}

export function resetRoutingSettings() {
  const localStorage = getLocalStorage(isBrowser);
  if (localStorage) {
    localStorage.removeItem('routingSettings');
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

export function setReadMessageIds(data) {
  setItem('readMessages', data);
}

export function getReadMessageIds() {
  /* Migrate old data */
  const oldMessages = getItemAsJson('messages', '[]');
  if (oldMessages.length !== 0) {
    const readMessageIds = oldMessages
      .filter(message => message[1].read)
      .map(message => message[0]);
    setReadMessageIds(readMessageIds);
    removeItem('messages');
  }

  return getItemAsJson('readMessages', '[]');
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
