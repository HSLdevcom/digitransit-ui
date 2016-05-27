import xhrPromise from '../util/xhr-promise';
import config from '../config';
import debounce from 'lodash/debounce';
import inside from 'point-in-polygon';
import { setOriginToDefault } from './EndpointActions';

const geolocator = (actionContext) => actionContext.getStore('ServiceStore').geolocator();
let position;

function reverseGeocodeAddress(actionContext, location, done) {
  const language = actionContext.getStore('PreferencesStore').getLanguage();

  return xhrPromise.getJson(config.URL.PELIAS_REVERSE_GEOCODER, {
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
    done();
  });
}

function broadcastCurrentLocation(actionContext) {
  if (position) {
    actionContext.dispatch('GeolocationFound', position);
  }
}

export function findLocation(actionContext, payload, done) {
  if (!geolocator(actionContext).geolocation) {
    actionContext.dispatch('GeolocationNotSupported');
    done();
  }

  broadcastCurrentLocation(actionContext);
  done();
}

const runReverseGeocodingAction = (actionContext, lat, lon, done) =>
  actionContext.executeAction(reverseGeocodeAddress, {
    lat,
    lon,
  }, done);

const debouncedRunReverseGeocodingAction = debounce(runReverseGeocodingAction, 60000, {
  leading: true,
});

const setCurrentLocation = (actionContext, pos) => {
  if (inside([pos.lon, pos.lat], config.areaPolygon)) {
    position = pos;
  } else {
    actionContext.executeAction(setOriginToDefault);
  }
};

export function startLocationWatch(actionContext, payload, done) {
  if (!geolocator(actionContext).geolocation) {
    actionContext.dispatch('GeolocationNotSupported');
    done();
  }

  actionContext.dispatch('GeolocationSearch');

  window.retrieveGeolocation = function retrieveGeolocation(pos, disableDebounce) {
    setCurrentLocation(actionContext, {
      lat: pos.coords.latitude,
      lon: pos.coords.longitude,
      heading: pos.coords.heading,
    });

    broadcastCurrentLocation(actionContext);

    if (disableDebounce) {
      runReverseGeocodingAction(actionContext, pos.coords.latitude, pos.coords.longitude, done);
    } else {
      debouncedRunReverseGeocodingAction(
        actionContext, pos.coords.latitude, pos.coords.longitude, done);
    }
  };

  window.retrieveGeolocationError = function retrieveGeolocationError(error) {
    if (error) {
      actionContext.piwik.trackEvent('geolocation', `status_${error.code}`, error.message);
      if (error.code < 10 && !actionContext.getStore('EndpointStore').getOrigin().userSetPosition) {
        actionContext.executeAction(setOriginToDefault);
      }
      if (error.code === 1) {
        actionContext.dispatch('GeolocationDenied');
      } else if (error.code === 2) {
        actionContext.dispatch('GeolocationNotSupported');
      } else if (error.code === 3) {
        actionContext.dispatch('GeolocationTimeout');
      } else if (error.code === 100001) {
        actionContext.dispatch('GeolocationWatchTimeout');
      }
    }
  };

  window.retrieveGeolocationTiming = function retrieveGeolocationTiming(timing) {
    actionContext.piwik.trackEvent('geolocation', 'status_OK', 'OK', timing);
  };

  if (window.position.error !== null) {
    window.retrieveGeolocationError(window.position.error);
    window.position.error = null;
  }

  if (window.position.pos !== null) {
    window.retrieveGeolocation(window.position.pos);
    window.position.pos = null;
  }

  if (window.position.timing !== null) {
    window.retrieveGeolocationTiming(window.position.timing);
    window.position.timing = null;
  }

  done();
}
