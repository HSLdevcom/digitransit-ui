import { isBrowser, isWindowsPhone, isIOSApp } from '../util/browser';
import { OptimizeType } from '../constants';

function handleSecurityError(error, logMessage) {
  if (error.name === 'SecurityError') {
    if (logMessage) {
      console.log(logMessage); // eslint-disable-line no-console
    }
  } else {
    throw error;
  }
}

export const getLocalStorage = (
  runningInBrowser,
  errorHandler = handleSecurityError,
) => {
  if (runningInBrowser) {
    try {
      return window.localStorage;
    } catch (error) {
      errorHandler(error);
      return null;
    }
  } else {
    return global.localStorage;
  }
};

function setItem(key, value) {
  const localStorage = getLocalStorage(isBrowser);
  if (localStorage) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        // eslint-disable-next-line no-console
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
  return getItemAsJson('customizedSettings', '{}');
}

export function setCustomizedSettings(data) {
  const getNumberValueOrDefault = (value, defaultValue) =>
    value !== undefined && value !== null ? Number(value) : defaultValue;
  const getValueOrDefault = (value, defaultValue) =>
    value !== undefined ? value : defaultValue;

  // Get old settings and test if set values have changed
  const oldSettings = getCustomizedSettings();
  const optimize = getValueOrDefault(data.optimize, oldSettings.optimize);

  const newSettings = {
    accessibilityOption: getNumberValueOrDefault(
      data.accessibilityOption,
      oldSettings.accessibilityOption,
    ),
    bikeSpeed: getNumberValueOrDefault(data.bikeSpeed, oldSettings.bikeSpeed),
    minTransferTime: getNumberValueOrDefault(
      data.minTransferTime,
      oldSettings.minTransferTime,
    ),
    modes: getValueOrDefault(data.modes, oldSettings.modes),
    optimize,
    preferredRoutes: getValueOrDefault(
      data.preferredRoutes,
      oldSettings.preferredRoutes,
    ),
    ticketTypes: getValueOrDefault(data.ticketTypes, oldSettings.ticketTypes),
    transferPenalty: getNumberValueOrDefault(
      data.transferPenalty,
      oldSettings.transferPenalty,
    ),
    unpreferredRoutes: getValueOrDefault(
      data.unpreferredRoutes,
      oldSettings.unpreferredRoutes,
    ),
    walkBoardCost: getNumberValueOrDefault(
      data.walkBoardCost,
      oldSettings.walkBoardCost,
    ),
    walkReluctance: getNumberValueOrDefault(
      data.walkReluctance,
      oldSettings.walkReluctance,
    ),
    walkSpeed: getNumberValueOrDefault(data.walkSpeed, oldSettings.walkSpeed),
    allowedBikeRentalNetworks: getValueOrDefault(
      data.allowedBikeRentalNetworks,
      oldSettings.allowedBikeRentalNetworks,
    ),
  };
  if (optimize === OptimizeType.Triangle) {
    newSettings.safetyFactor = getNumberValueOrDefault(
      data.safetyFactor,
      oldSettings.safetyFactor,
    );
    newSettings.slopeFactor = getNumberValueOrDefault(
      data.slopeFactor,
      oldSettings.slopeFactor,
    );
    newSettings.timeFactor = getNumberValueOrDefault(
      data.timeFactor,
      oldSettings.timeFactor,
    );
  } else {
    delete newSettings.safetyFactor;
    delete newSettings.slopeFactor;
    delete newSettings.timeFactor;
  }
  if (
    newSettings.preferredRoutes !== undefined &&
    newSettings.preferredRoutes.length === 0
  ) {
    delete newSettings.preferredRoutes;
  }
  if (
    newSettings.unpreferredRoutes !== undefined &&
    newSettings.unpreferredRoutes.length === 0
  ) {
    delete newSettings.unpreferredRoutes;
  }

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

export function getFavouriteStorage() {
  return getItemAsJson('favouriteStore');
}

export function setFavouriteStorage(data) {
  return setItem('favouriteStore', data);
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

export const setMapLayerSettings = settings => {
  setItem('map-layers', settings);
};

export const getMapLayerSettings = () => getItemAsJson('map-layers', '{}');

/**
 * Sets the seen state of the given dialog.
 *
 * @param {string} dialogId The identifier of the dialog. Will be ignored if falsey.
 * @param {boolean} seen Whether the dialog has been seen. Defaults to true.
 */
export const setDialogState = (dialogId, seen = true) => {
  if (!dialogId) {
    return;
  }
  const dialogStates = getItemAsJson('dialogState', '{}');
  dialogStates[`${dialogId}`] = seen;
  setItem('dialogState', dialogStates);
};

/**
 * Checks if the given dialog has been seen by the user.
 *
 * @param {string} dialogId The identifier of the dialog.
 */
export const getDialogState = dialogId =>
  getItemAsJson('dialogState', '{}')[`${dialogId}`] === true;
