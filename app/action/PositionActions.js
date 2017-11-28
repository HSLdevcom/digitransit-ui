import debounce from 'lodash/debounce';
import d from 'debug';
import { getJson } from '../util/xhrPromise';
import { getPositioningHasSucceeded } from '../store/localStorage';
import geolocationMessages from '../util/geolocationMessages';

const debug = d('PositionActions.js');

let geoWatchId;

function reverseGeocodeAddress(actionContext, location) {
  const language = actionContext.getStore('PreferencesStore').getLanguage();

  return getJson(actionContext.config.URL.PELIAS_REVERSE_GEOCODER, {
    'point.lat': location.lat,
    'point.lon': location.lon,
    lang: language,
    size: 1,
    layers: 'address',
  }).then(data => {
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

const runReverseGeocodingAction = (actionContext, lat, lon, done) =>
  actionContext.executeAction(
    reverseGeocodeAddress,
    {
      lat,
      lon,
    },
    done,
  );

const debouncedRunReverseGeocodingAction = debounce(
  runReverseGeocodingAction,
  60000,
  {
    leading: true,
  },
);

const setCurrentLocation = (actionContext, position) =>
  actionContext.dispatch('GeolocationFound', position);

export function geolocatonCallback(
  actionContext,
  { pos, disableDebounce },
  done,
) {
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
      done,
    );
  } else {
    debouncedRunReverseGeocodingAction(
      actionContext,
      pos.coords.latitude,
      pos.coords.longitude,
      done,
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
function watchPosition(actionContext, done) {
  debug('watchPosition');
  const quietTimeoutSeconds = 20;

  let timeout = setTimeout(() => {
    actionContext.dispatch('GeolocationWatchTimeout');
    updateGeolocationMessage(actionContext, 'timeout');
  }, quietTimeoutSeconds * 1000);
  try {
    geoWatchId = navigator.geoapi.watchPosition(
      position => {
        if (timeout !== null) {
          clearTimeout(timeout);
          timeout = null;
        }
        geolocatonCallback(actionContext, { pos: position });
      },
      error => {
        if (timeout !== null) {
          clearTimeout(timeout);
          timeout = null;
        }
        dispatchGeolocationError(actionContext, error);
      },
      { enableHighAccuracy: true, timeout: 60000, maximumAge: 60000 },
    );
  } catch (error) {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    actionContext.dispatch('GeolocationNotSupported');
    updateGeolocationMessage(actionContext, 'failed');
    console.error(error);
  }
  done();
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
          resolve(permissionStatus);
        });
    }
  });

  return p;
}

function startPositioning(actionContext, done) {
  checkPositioningPermission().then(status => {
    debug('Examining permission', status);
    switch (status.state) {
      case 'granted':
        updateGeolocationMessage(actionContext);
        watchPosition(actionContext, done);
        break;
      case 'denied':
        actionContext.dispatch('GeolocationDenied');
        updateGeolocationMessage(actionContext, 'denied');
        done('denied');
        break;
      case 'prompt':
        watchPosition(actionContext, done);
        // it was, let's listen for changes
        // eslint-disable-next-line no-param-reassign
        status.onchange = permissionStatusChangeEvent => {
          const permissionStatus = permissionStatusChangeEvent.target;
          debug('permission status changed', permissionStatus);
          // eslint-disable-next-line no-param-reassign
          status.onchange = null; // remove listener
          if (permissionStatus.state === 'granted') {
            actionContext.dispatch('GeolocationSearch');
            done();
            updateGeolocationMessage(actionContext);
          } else if (permissionStatus.state === 'denied') {
            actionContext.dispatch('GeolocationDenied');
            done('denied');
            updateGeolocationMessage(actionContext, 'denied');
          }
        };
        break;
      default:
        // browsers not supporting permission api
        actionContext.dispatch('GeolocationSearch');
        watchPosition(actionContext, done);
        break;
    }
  });
}

/* starts location watch */
export function startLocationWatch(actionContext, payload) {
  // Check if we need to manually start positioning
  const done = error => {
    if (
      error === undefined &&
      typeof payload.onPositioningStarted === 'function'
    ) {
      payload.onPositioningStarted();
    }
  };
  if (typeof geoWatchId === 'undefined') {
    startPositioning(actionContext, done); // from geolocation.js
  } else {
    done();
  }
}
let init = false;

export function initGeolocation(actionContext, payload, done) {
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
        startPositioning(actionContext, done);
      } else {
        debug('Not starting positioning');
        done();
      }
    });
  }
}
