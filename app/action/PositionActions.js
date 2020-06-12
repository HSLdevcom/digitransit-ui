import debounce from 'lodash/debounce';
import d from 'debug';
import { reverseGeocode } from '../util/searchUtils';
import { getPositioningHasSucceeded } from '../store/localStorage';
import geolocationMessages from '../util/geolocationMessages';
import { addAnalyticsEvent } from '../util/analyticsUtils';

const debug = d('PositionActions.js');

let geoWatchId;

function reverseGeocodeAddress(actionContext, location) {
  const language = actionContext.getStore('PreferencesStore').getLanguage();

  return reverseGeocode(
    {
      'point.lat': location.lat,
      'point.lon': location.lon,
      lang: language,
      size: 1,
      layers: 'address',
    },
    actionContext.config,
  ).then(data => {
    if (data.features != null && data.features.length > 0) {
      const match = data.features[0].properties;
      actionContext.dispatch('AddressFound', {
        address: match.name,
        city: match.localadmin || match.locality,
      });
    } else {
      actionContext.dispatch('AddressFound', {});
    }
  });
}

const runReverseGeocodingAction = (actionContext, lat, lon) =>
  actionContext.executeAction(reverseGeocodeAddress, {
    lat,
    lon,
  });

const debouncedRunReverseGeocodingAction = debounce(
  runReverseGeocodingAction,
  10000,
  {
    leading: true,
  },
);

const setCurrentLocation = (actionContext, position) =>
  actionContext.dispatch('GeolocationFound', position);

export function geolocatonCallback(actionContext, { pos, disableDebounce }) {
  setCurrentLocation(actionContext, {
    lat: pos.coords.latitude,
    lon: pos.coords.longitude,
    heading: pos.coords.heading,
    disableFiltering: disableDebounce,
  });

  if (disableDebounce) {
    runReverseGeocodingAction(
      actionContext,
      pos.coords.latitude,
      pos.coords.longitude,
    );
  } else {
    debouncedRunReverseGeocodingAction(
      actionContext,
      pos.coords.latitude,
      pos.coords.longitude,
    );
  }
}

function updateGeolocationMessage(actionContext, newId) {
  Object.keys(geolocationMessages).forEach(id => {
    if (id !== newId) {
      actionContext.dispatch('MarkMessageAsRead', geolocationMessages[id].id);
    }
  });

  if (newId) {
    actionContext.dispatch('AddMessage', geolocationMessages[newId]);
  }
}

function dispatchGeolocationError(actionContext, error) {
  if (!actionContext.getStore('PositionStore').getLocationState().hasLocation) {
    switch (error.code) {
      case 1:
        actionContext.dispatch('GeolocationDenied');
        updateGeolocationMessage(actionContext, 'denied');
        break;
      case 2:
        actionContext.dispatch('GeolocationNotSupported');
        updateGeolocationMessage(actionContext, 'failed');
        break;
      case 3:
        actionContext.dispatch('GeolocationTimeout');
        updateGeolocationMessage(actionContext, 'timeout');
        break;
      default:
        break;
    }
  }
}

// set watcher for geolocation
function watchPosition(actionContext) {
  debug('watchPosition');
  const quietTimeoutSeconds = 20;

  let timeout = setTimeout(() => {
    actionContext.dispatch('GeolocationWatchTimeout');
    updateGeolocationMessage(actionContext, 'timeout');
  }, quietTimeoutSeconds * 1000);
  try {
    geoWatchId = navigator.geoapi.watchPosition(
      (position, disableDebounce) => {
        updateGeolocationMessage(actionContext);
        if (timeout !== null) {
          clearTimeout(timeout);
          timeout = null;
        }
        geolocatonCallback(actionContext, { pos: position, disableDebounce });
      },
      error => {
        if (timeout !== null) {
          clearTimeout(timeout);
          timeout = null;
        }
        navigator.geolocation.clearWatch(geoWatchId);
        geoWatchId = undefined;
        dispatchGeolocationError(actionContext, error);
      },
      { enableHighAccuracy: true, timeout: 60000, maximumAge: 60000 },
    );
  } catch (error) {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
      navigator.geolocation.clearWatch(geoWatchId);
      geoWatchId = undefined;
    }
    actionContext.dispatch('GeolocationNotSupported');
    updateGeolocationMessage(actionContext, 'failed');
    console.error(error); // eslint-disable-line no-console
  }
}

/**
 * Small wrapper around permission api.
 * Returns a promise of checking positioning permission.
 * resolving to null means there's no permission api.
 */
export function checkPositioningPermission() {
  const p = new Promise(resolve => {
    if (window.mock !== undefined) {
      debug('mock permission');
      resolve({ state: window.mock.permission });
      return;
    }
    if (!navigator.permissions) {
      resolve({ state: null });
    } else {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then(permissionStatus => {
          if (permissionStatus.state === 'prompt') {
            // track when user allows geolocation
            /* eslint-disable no-param-reassign */
            permissionStatus.onchange = function() {
              if (this.state === 'granted') {
                addAnalyticsEvent({
                  category: 'Map',
                  action: 'AllowGeolocation',
                  name: null,
                });
                permissionStatus.onchange = null;
              }
            };
          }
          resolve(permissionStatus);
        });
    }
  });

  return p;
}

function startPositioning(actionContext) {
  checkPositioningPermission().then(status => {
    debug('Examining permission', status);
    switch (status.state) {
      case 'granted':
        actionContext.dispatch('GeolocationSearch');
        updateGeolocationMessage(actionContext);
        watchPosition(actionContext);
        break;
      case 'denied':
        actionContext.dispatch('GeolocationDenied');
        updateGeolocationMessage(actionContext, 'denied');
        break;
      case 'prompt':
        updateGeolocationMessage(actionContext, 'prompt');
        actionContext.dispatch('GeolocationSearch');
        watchPosition(actionContext);
        break;
      default:
        // browsers not supporting permission api
        actionContext.dispatch('GeolocationSearch');
        watchPosition(actionContext);
        break;
    }
  });
}

/* starts location watch */
export function startLocationWatch(actionContext) {
  if (typeof geoWatchId === 'undefined') {
    debug('starting...');
    startPositioning(actionContext); // from geolocation.js
  } else {
    debug('already started...');
  }
}
let init = false;

/**
 * This is called only from Index page.
 * TODO all other states but granted are not needed here
 */
export function initGeolocation(actionContext) {
  if (init === true) {
    debug('Already initialized, bailing out');
    return;
  }
  init = true;
  let start = false;
  debug('Initializing');

  if (window.mock !== undefined) {
    debug('Geolocation mock is enabled', window.mock);
    start = true;
  }

  if (!navigator.geoapi) {
    debug('Geolocation is not supported');
    actionContext.dispatch('GeolocationNotSupported');
    updateGeolocationMessage(actionContext, 'failed');
  } else {
    // Check if we have previous permissions to get geolocation.
    // If yes, start immediately, if not, we will not prompt for permission at this point.
    checkPositioningPermission().then(status => {
      debug('examining status', status);
      switch (status.state) {
        case 'granted':
          debug('Permission granted.');
          start = true;
          updateGeolocationMessage(actionContext);
          break;
        case 'denied':
          debug('Permission denied.');
          // for ff with permisson api display error immediately instead of timeout error
          actionContext.dispatch('GeolocationDenied');
          updateGeolocationMessage(actionContext, 'denied');
          break;
        case null: // no permission api
          start = getPositioningHasSucceeded(true);
          break;
        default:
          start = true; // TODO
          debug('Unprocessed result:', status.state);
          break;
      }
      if (start === true) {
        debug('Starting positioning');
        startPositioning(actionContext);
      } else {
        debug('Not starting positioning');
      }
    });
  }
}
