import debounce from 'lodash/debounce';
import { reverseGeocode } from '../../utils/client/geocodingUtils';
import { geolocationMessages } from '../../utils/client/geolocationMessages';
import { addAnalyticsEvent } from '../../utils/client/analyticsUtils';
import { messageActions } from '../hooks/MessageContext';

const MOCKPOS = false;

function updateGeolocationMessage(newId) {
  Object.keys(geolocationMessages).forEach(id => {
    if (id !== newId) {
      messageActions.markMessageAsRead(geolocationMessages[id].id);
    }
  });

  if (newId) {
    messageActions.addMessage(geolocationMessages[newId]);
  }
}

export function createPositionService(config, dispatch, getPosition) {
  let geoWatchId;
  let watchPending = false;
  let pendingWatchId = 0;
  let mockInterval;
  let watchTimeout;
  let disposed = false;

  function reverseGeocodeAddress(coords) {
    reverseGeocode(config, coords)
      .then(location => dispatch({ type: 'address-found', location }))
      .catch(() => dispatch({ type: 'address-found', location: {} }));
  }

  const debouncedReverseGeocoding = debounce(reverseGeocodeAddress, 10000, {
    leading: true,
  });

  function geoCallback(pos) {
    dispatch({ type: 'reverse-geocoding-started' });
    dispatch({
      type: 'geolocation-found',
      location: {
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        heading: pos.coords.heading,
      },
    });
    debouncedReverseGeocoding(pos.coords);
  }

  function dispatchGeolocationError(error) {
    if (!getPosition().hasLocation) {
      switch (error.code) {
        case 1:
          dispatch({ type: 'geolocation-denied' });
          updateGeolocationMessage('denied');
          break;
        case 2:
          dispatch({ type: 'geolocation-not-supported' });
          updateGeolocationMessage('failed');
          break;
        case 3:
          dispatch({ type: 'geolocation-timeout' });
          updateGeolocationMessage('timeout');
          break;
        default:
          break;
      }
    }
  }

  function mockPositionChange() {
    const pos = getPosition();
    if (pos.hasLocation) {
      geoCallback({
        coords: {
          latitude: pos.lat + (Math.random() - 0.5) * 0.001,
          longitude: pos.lon + (Math.random() - 0.5) * 0.001,
          heading: 0,
        },
      });
    }
  }

  function watchPosition() {
    const quietTimeoutSeconds = 20;

    watchTimeout = setTimeout(() => {
      watchTimeout = undefined;
      dispatch({ type: 'geolocation-watch-timeout' });
      updateGeolocationMessage('timeout');
    }, quietTimeoutSeconds * 1000);

    try {
      if (MOCKPOS) {
        mockInterval = setInterval(mockPositionChange, 5000);
      }
      geoWatchId = navigator.geolocation.watchPosition(
        position => {
          updateGeolocationMessage();
          if (watchTimeout !== undefined) {
            clearTimeout(watchTimeout);
            watchTimeout = undefined;
          }
          const { latitude: lat, longitude: lon } = position.coords;
          if (
            lat !== undefined &&
            !Number.isNaN(lat) &&
            lon !== undefined &&
            !Number.isNaN(lon)
          ) {
            geoCallback(position);
          }
        },
        error => {
          if (watchTimeout !== undefined) {
            clearTimeout(watchTimeout);
            watchTimeout = undefined;
          }
          navigator.geolocation.clearWatch(geoWatchId);
          geoWatchId = undefined;
          dispatch({ type: 'watch-stopped' });
          dispatchGeolocationError(error);
        },
        { enableHighAccuracy: true, timeout: 60000, maximumAge: 60000 },
      );
      dispatch({ type: 'watch-started', watchId: geoWatchId });
    } catch (error) {
      if (watchTimeout !== undefined) {
        clearTimeout(watchTimeout);
        watchTimeout = undefined;
      }
      if (geoWatchId !== undefined) {
        navigator.geolocation.clearWatch(geoWatchId);
      }
      geoWatchId = undefined;
      dispatch({ type: 'watch-stopped' });
      dispatch({ type: 'geolocation-not-supported' });
      updateGeolocationMessage('failed');
      console.error(error); // eslint-disable-line no-console
    }
  }

  function checkPositioningPermission() {
    return new Promise(resolve => {
      if (!navigator.permissions) {
        resolve({ state: 'error' });
        return;
      }

      navigator.permissions
        .query({ name: 'geolocation' })
        .then(permissionStatus => {
          if (permissionStatus.state === 'prompt') {
            /* eslint-disable no-param-reassign */
            permissionStatus.onchange = function permissionChanged() {
              if (this.state === 'granted') {
                dispatch({ type: 'geolocation-search' });
                addAnalyticsEvent({
                  category: 'Map',
                  action: 'AllowGeolocation',
                  name: null,
                });
                permissionStatus.onchange = null;
              }
            };
            /* eslint-enable no-param-reassign */
          }
          resolve(permissionStatus);
        })
        .catch(() => resolve({ state: 'error' }));
    });
  }

  function startLocationWatch() {
    if (disposed || geoWatchId !== undefined || watchPending) {
      return;
    }
    watchPending = true;
    pendingWatchId += 1;
    const requestId = pendingWatchId;
    checkPositioningPermission().then(status => {
      if (disposed || requestId !== pendingWatchId) {
        return;
      }
      switch (status.state) {
        case 'granted':
          dispatch({ type: 'geolocation-search' });
          updateGeolocationMessage();
          watchPosition();
          break;
        case 'denied':
          dispatch({ type: 'geolocation-denied' });
          updateGeolocationMessage('denied');
          break;
        case 'prompt':
          updateGeolocationMessage('prompt');
          dispatch({ type: 'geolocation-prompt' });
          watchPosition();
          break;
        default:
          dispatch({ type: 'geolocation-search' });
          watchPosition();
          break;
      }
      watchPending = false;
    });
  }

  function stopLocationWatch(notify = true) {
    pendingWatchId += 1;
    watchPending = false;
    if (watchTimeout !== undefined) {
      clearTimeout(watchTimeout);
      watchTimeout = undefined;
    }
    if (geoWatchId !== undefined) {
      navigator.geolocation.clearWatch(geoWatchId);
      geoWatchId = undefined;
    }
    if (mockInterval !== undefined) {
      clearInterval(mockInterval);
      mockInterval = undefined;
    }
    if (notify) {
      dispatch({ type: 'watch-stopped' });
    }
  }

  function dispose() {
    disposed = true;
    stopLocationWatch(false);
    debouncedReverseGeocoding.cancel();
  }

  function activate() {
    disposed = false;
  }

  function showGeolocationDeniedMessage() {
    dispatch({ type: 'geolocation-denied' });
    updateGeolocationMessage('denied');
  }

  return {
    activate,
    checkPositioningPermission,
    dispose,
    showGeolocationDeniedMessage,
    startLocationWatch,
    stopLocationWatch,
  };
}
