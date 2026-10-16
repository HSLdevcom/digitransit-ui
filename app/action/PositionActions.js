import debounce from 'lodash/debounce';
import { reverseGeocode } from '../../utils/client/geocodingUtils';
import { geolocationMessages } from '../../utils/client/geolocationMessages';
import { addAnalyticsEvent } from '../../utils/shared/analyticsUtils';
import { messageActions } from '../hooks/MessageContext';

const MOCKPOS = false;
let geoWatchId;
let config;

// Must be called once at bootstrap, before any location watch is started.
// TODO: remove when PositionStore is replaced by a context that can read config via hook
export function initPositionActions(appConfig) {
  config = appConfig;
}

function reverseGeocodeAddress(actionContext, coords) {
  if (!config) {
    throw new Error('initPositionActions must be called before geocoding');
  }
  reverseGeocode(config, coords)
    .then(address => {
      actionContext.dispatch('AddressFound', address);
    })
    .catch(() => {
      actionContext.dispatch('AddressFound', {});
    });
}

const runReverseGeocodingAction = (actionContext, coords) =>
  actionContext.executeAction(reverseGeocodeAddress, coords);

const debouncedReverseGeocoding = debounce(runReverseGeocodingAction, 10000, {
  leading: true,
});

function geoCallback(actionContext, pos) {
  actionContext.dispatch('StartReverseGeocoding');
  actionContext.dispatch('GeolocationFound', {
    lat: pos.coords.latitude,
    lon: pos.coords.longitude,
    heading: pos.coords.heading,
  });
  debouncedReverseGeocoding(actionContext, pos.coords);
}

function updateGeolocationMessage(actionContext, newId) {
  Object.keys(geolocationMessages).forEach(id => {
    if (id !== newId) {
      messageActions.markMessageAsRead(geolocationMessages[id].id);
    }
  });

  if (newId) {
    messageActions.addMessage(geolocationMessages[newId]);
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

function mockPositionChange(actionContext) {
  const pos = actionContext.getStore('PositionStore').getLocationState();
  if (pos.hasLocation) {
    const newPos = {
      coords: {
        latitude: pos.lat + (Math.random() - 0.5) * 0.001,
        longitude: pos.lon + (Math.random() - 0.5) * 0.001,
        heading: 0,
      },
    };
    geoCallback(actionContext, newPos);
  }
}

// set watcher for geolocation
function watchPosition(actionContext) {
  const quietTimeoutSeconds = 20;

  let timeout = setTimeout(() => {
    actionContext.dispatch('GeolocationWatchTimeout');
    updateGeolocationMessage(actionContext, 'timeout');
  }, quietTimeoutSeconds * 1000);
  try {
    if (MOCKPOS) {
      setInterval(mockPositionChange, 5000, actionContext);
    }
    geoWatchId = navigator.geolocation.watchPosition(
      position => {
        updateGeolocationMessage(actionContext);
        if (timeout !== null) {
          clearTimeout(timeout);
          timeout = null;
        }
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        if (
          lat !== undefined &&
          !Number.isNaN(lat) &&
          lon !== undefined &&
          !Number.isNaN(lon)
        ) {
          geoCallback(actionContext, position);
        }
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
    actionContext.dispatch('storeWatchId', geoWatchId);
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
 */
export function checkPositioningPermission(actionContext) {
  const p = new Promise(resolve => {
    if (!navigator.permissions) {
      resolve({ state: 'error' });
    } else {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then(permissionStatus => {
          if (permissionStatus.state === 'prompt') {
            // track when user allows geolocation
            /* eslint-disable no-param-reassign */
            permissionStatus.onchange = function permOnChange() {
              if (this.state === 'granted') {
                actionContext?.dispatch('GeolocationSearch');
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

let watchPending;

/* starts location watch */
export function startLocationWatch(actionContext) {
  if (typeof geoWatchId === 'undefined' && !watchPending) {
    watchPending = true;
    checkPositioningPermission(actionContext).then(status => {
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
          actionContext.dispatch('GeolocationPrompt');
          watchPosition(actionContext);
          break;
        default:
          // browsers not supporting permission api
          actionContext.dispatch('GeolocationSearch');
          watchPosition(actionContext);
          break;
      }
      watchPending = false;
    });
  }
}

/* stops location watch */
export function stopLocationWatch() {
  if (typeof geoWatchId !== 'undefined') {
    navigator.geolocation.clearWatch(geoWatchId);
    geoWatchId = undefined;
  }
  watchPending = false;
}

export function showGeolocationDeniedMessage(actionContext) {
  actionContext.dispatch('GeolocationDenied');
  updateGeolocationMessage(actionContext, 'denied');
}
