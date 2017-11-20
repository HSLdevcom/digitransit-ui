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

let alreadyDenied;

function updateGeolocationMessage(actionContext, newId) {
  Object.keys(geolocationMessages).forEach(id => {
    if (id !== newId) {
      actionContext.dispatch('MarkMessageAsRead', geolocationMessages[id].id);
    }
  });

  if (newId) {
    let id = newId;
    if (newId === 'denied') {
      if (alreadyDenied) {
        // change message when shown repeatedly
        id = 'stillDenied';
      } else {
        alreadyDenied = true;
      }
    }
    actionContext.dispatch('AddMessage', geolocationMessages[id]);
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

function startPositioning(actionContext, done, ignorePermissionCheck) {
  debug('startPositioning:', ignorePermissionCheck);
  if (navigator.permissions !== undefined && !ignorePermissionCheck) {
    // check permission state
    navigator.permissions
      .query({ name: 'geolocation' })
      .then(permissionStatus => {
        if (permissionStatus.state === 'prompt') {
          // it was, let's listen for changes
          // eslint-disable-next-line no-param-reassign
          permissionStatus.onchange = () => {
            // eslint-disable-next-line no-param-reassign
            permissionStatus.onchange = null; // remove listener
            if (permissionStatus.state === 'granted') {
              actionContext.dispatch('GeolocationSearch');
              updateGeolocationMessage(actionContext);
            } else if (permissionStatus.state === 'denied') {
              actionContext.dispatch('GeolocationDenied');
              updateGeolocationMessage(actionContext, 'denied');
            }
          };
          actionContext.dispatch('GeolocationPrompt');
          updateGeolocationMessage(actionContext, 'prompt');
          watchPosition(actionContext, done);
        } else if (permissionStatus.state === 'granted') {
          actionContext.dispatch('GeolocationSearch');
          updateGeolocationMessage(actionContext);
          watchPosition(actionContext, done);
        } else if (permissionStatus.state === 'denied') {
          actionContext.dispatch('GeolocationDenied');
          updateGeolocationMessage(actionContext, 'denied');
          done();
        }
      });
  } else {
    // browsers not supporting permission api
    actionContext.dispatch('GeolocationSearch');
    watchPosition(actionContext, done);
  }
}

/* starts location watch */
export function startLocationWatch(actionContext, payload, done) {
  // Check if we need to manually start positioning
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
  } else if (window.mock === undefined && navigator.permissions !== undefined) {
    debug('Permission api available');
    // Check if we have previous permissions to get geolocation.
    // If yes, start immediately, if not, we will not prompt for permission at this point.
    navigator.permissions.query({ name: 'geolocation' }).then(result => {
      if (result.state === 'granted') {
        debug('Permission granted, starting positioning');
        start = true;
        updateGeolocationMessage(actionContext);
      } else if (result.state === 'denied') {
        debug('Permission denied.');
        // for ff with permisson api display error immediately instead of timeout error
        actionContext.dispatch('GeolocationDenied');
        updateGeolocationMessage(actionContext, 'denied');
      } else {
        start = true; // TODO
        debug('Unprocessed result', result);
      }
      if (start === true) {
        debug('Starting positioning');
        startPositioning(actionContext, done, true);
      } else {
        debug('Not starting positioning');
        done();
      }
    });
  } else if (start || getPositioningHasSucceeded(true)) {
    debug('Starting positioning');
    startPositioning(actionContext, done, true);
  } else {
    debug('Not starting positioning');
    done();
  }
}
