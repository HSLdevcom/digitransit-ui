import xhrPromise from '../util/xhr-promise';
import config from '../config';
import debounce from 'lodash/debounce';
import inside from 'point-in-polygon';
import EndpointActions from './endpoint-actions';

function geolocator(actionContext) {
  actionContext.getStore('ServiceStore').geolocator();
}

export function reverseGeocodeAddress(actionContext, location, done) {
  const language = actionContext.getStore('PreferencesStore').getLanguage();

  return xhrPromise.getJson(config.URL.PELIAS_REVERSE_GEOCODER, {
    'point.lat': location.lat,
    'point.lon': location.lon,
    lang: language,
    size: 1,
  }).then((data) => {
    let match;

    if (data.features != null && data.features.length > 0) {
      match = data.features[0].properties;

      actionContext.dispatch('AddressFound', {
        address: match.street,
        number: match.housenumber,
        city: match.locality,
      });
    }

    return done();
  });
}

function broadcastCurrentLocation(actionContext) {
  if (window.position) {
    actionContext.dispatch('GeolocationFound', window.position);
  }
}

export function findLocation(actionContext, payload, done) {
  if (!geolocator(actionContext).geolocation) {
    actionContext.dispatch('GeolocationNotSupported');
    return done();
  }

  broadcastCurrentLocation(actionContext);
  return done();
}

function runReverseGeocodingAction(actionContext, lat, lon, done) {
  actionContext.executeAction(reverseGeocodeAddress, {
    lat,
    lon,
  }, done);
}


function debouncedRunReverseGeocodingAction() {
  debounce(runReverseGeocodingAction, 60000, {
    leading: true,
  });
}

function setCurrentLocation(actionContext, pos) {
  if (inside([pos.lon, pos.lat], config.areaPolygon)) {
    window.position = pos;
  } else {
    actionContext.executeAction(EndpointActions.setOriginToDefault);
  }
}

export function startLocationWatch(actionContext, payload, done) {
  if (geolocator(actionContext) && !geolocator(actionContext).geolocation) {
    actionContext.dispatch('GeolocationNotSupported');
    done();
    return;
  }

  actionContext.dispatch('GeolocationSearch');

  let timeoutId = window.setTimeout(() => actionContext.dispatch('GeolocationWatchTimeout'), 10000);

  window.retrieveGeolocation = (position) => {
    if (window.position.pos != null) {
      window.position.pos = null;
    }

    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timeoutId = undefined;
    }

    setCurrentLocation(actionContext, {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
      heading: position.coords.heading,
    });

    broadcastCurrentLocation(actionContext);
    debouncedRunReverseGeocodingAction(
      actionContext,
      position.coords.latitude,
      position.coords.longitude,
      done
    );
  };

  window.retrieveError = (error) => {
    if (error) {
      if (!actionContext.getStore('EndpointStore').getOrigin().userSetPosition) {
        actionContext.executeAction(EndpointActions.setOriginToDefault);
      }

      if (error.code === 1) {
        return actionContext.dispatch('GeolocationDenied');
      } else if (error.code === 2) {
        return actionContext.dispatch('GeolocationNotSupported');
      } else if (error.code === 3) {
        return actionContext.dispatch('GeolocationTimeout');
      }
    }
    return null;
  };

  if (window.position.error != null) {
    window.retrieveError(window.position.error);
    window.position.error = null;
  }

  if (window.position.pos != null) {
    window.retrieveGeolocation(window.position.pos);
    window.position.pos = null;
  }
  done();
}
