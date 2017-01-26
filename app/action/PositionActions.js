import debounce from 'lodash/debounce';
import inside from 'point-in-polygon';
import { getJson } from '../util/xhrPromise';
import { setOriginToDefault } from './EndpointActions';
import { getPositioningHasSucceeded } from '../store/localStorage';
import { createMock } from './MockActions';

let geoWatchId;

function reverseGeocodeAddress(actionContext, location) {
  const language = actionContext.getStore('PreferencesStore').getLanguage();

  return getJson(actionContext.config.URL.PELIAS_REVERSE_GEOCODER, {
    'point.lat': location.lat,
    'point.lon': location.lon,
    lang: language,
    size: 1,
    layers: 'address',
  }).then((data) => {
    if (data.features != null && data.features.length > 0) {
      const match = data.features[0].properties;
      actionContext.dispatch('AddressFound', {
        address: match.name,
        city: match.localadmin || match.locality,
      });
    }
  });
}

const runReverseGeocodingAction = (actionContext, lat, lon, done) =>
  actionContext.executeAction(reverseGeocodeAddress, {
    lat,
    lon,
  }, done);

const debouncedRunReverseGeocodingAction = debounce(runReverseGeocodingAction, 60000, {
  leading: true,
});

const setCurrentLocation = (actionContext, position) => {
  if (inside([position.lon, position.lat], actionContext.config.areaPolygon)) {
    actionContext.dispatch('GeolocationFound', position);
  } else if (!actionContext.getStore('EndpointStore').getOrigin().userSetPosition) {
    // TODO: should we really do this?
    actionContext.executeAction(setOriginToDefault, null);
  }
};

export function geolocatonCallback(actionContext, { pos, disableDebounce }, done) {
  setCurrentLocation(actionContext, {
    lat: pos.coords.latitude,
    lon: pos.coords.longitude,
    heading: pos.coords.heading,
    disableFiltering: disableDebounce,
  });

  if (disableDebounce) {
    runReverseGeocodingAction(actionContext, pos.coords.latitude, pos.coords.longitude, done);
  } else {
    debouncedRunReverseGeocodingAction(
      actionContext, pos.coords.latitude, pos.coords.longitude, done);
  }
}

function dispatchGeolocationError(actionContext, error) {
  if (
    !(actionContext.getStore('EndpointStore').getOrigin().userSetPosition ||
      actionContext.getStore('PositionStore').getLocationState().hasLocation)
  ) {
    switch (error.code) {
      case 1: actionContext.dispatch('GeolocationDenied'); break;
      case 2: actionContext.dispatch('GeolocationNotSupported'); break;
      case 3: actionContext.dispatch('GeolocationTimeout'); break;
      default: break;
    }
  }
}

// set watcher for geolocation
function watchPosition(actionContext, done) {
  const quietTimeoutSeconds = 20;

  let timeout = setTimeout(
    () => actionContext.dispatch('GeolocationWatchTimeout'),
    quietTimeoutSeconds * 1000,
  );
  try {
    geoWatchId = navigator.geolocation.watchPosition(
      (position) => {
        if (timeout !== null) {
          clearTimeout(timeout);
          timeout = null;
        }
        geolocatonCallback(actionContext, { pos: position });
      },
      (error) => {
        if (timeout !== null) {
          clearTimeout(timeout);
          timeout = null;
        }
        dispatchGeolocationError(actionContext, error);
      },
      { enableHighAccuracy: true, timeout: 60000, maximumAge: 60000 },
    );
  } catch (error) {
    actionContext.dispatch('GeolocationNotSupported');
    console.error(error);
  }
  done();
}

function startPositioning(actionContext, done) {
  if (navigator.permissions !== undefined) {
    // check permission state
    navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
      if (permissionStatus.state === 'prompt') {
        // it was, let's listen for changes
        // eslint-disable-next-line no-param-reassign
        permissionStatus.onchange = () => {
          // eslint-disable-next-line no-param-reassign
          permissionStatus.onchange = null; // remove listener
          if (permissionStatus.state === 'granted') {
            actionContext.dispatch('GeolocationSearch');
          } else if (permissionStatus.state === 'denied') {
            actionContext.dispatch('GeolocationDenied');
          }
        };
        actionContext.dispatch('GeolocationPrompt');
        watchPosition(actionContext, done);
      } else if (permissionStatus.state === 'granted') {
        actionContext.dispatch('GeolocationSearch');
        watchPosition(actionContext, done);
      } else if (permissionStatus.state === 'denied') {
        actionContext.dispatch('GeolocationDenied');
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
    startPositioning(actionContext, done);  // from geolocation.js
  } else {
    done();
  }
}

export function initGeolocation(actionContext, payload, done) {
  if (location.search.includes('mock')) {
    actionContext.executeAction(createMock, null, done);
  } else if (!navigator.geolocation) {
    actionContext.dispatch('GeolocationNotSupported');
    done();
  } else if (navigator.permissions !== undefined) {
    // Check if we have previous permissions to get geolocation.
    // If yes, start immediately, if not, we will not prompt for permission at this point.
    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'granted') {
        startPositioning(actionContext, done);
      } else if (result.state === 'denied') {
        // for ff with permisson api display error immediately instead of timeout error
        actionContext.dispatch('GeolocationDenied');
        done();
      } else {
        done();
      }
    });
  } else if (getPositioningHasSucceeded(true)) {
    // browser does not support permission api
    // Only check for Mobile IE
    startPositioning(actionContext, done);
  } else {
    done();
  }
}
