(function() {
  var startTime = new Date().getTime();

  var quietTimeoutSeconds = 20;

  window.position = {
    pos: null,
    error: null,
    timing: null
  }

  window.retrieveGeolocation = function retrieveGeolocation(pos) {
    window.position.pos = pos;
  }

  window.retrieveGeolocationError = function retrieveGeolocationError(error) {
    window.position.error = error;
  }

  window.retrieveGeolocationTiming = function retrieveGeolocationTiming(timing) {
    window.position.timing = timing;
  }

  //timeout timer for geolocation
  var timeout = setTimeout(function () {
    window.retrieveGeolocationError({code: 100001, message: "No location retrieved for " + quietTimeoutSeconds + " seconds."});
  }, quietTimeoutSeconds * 1000);

  setTimeout(function () {
    if (window.location.search.indexOf('mock') === -1 && navigator.geolocation !== undefined) {
      window.geoWatchId = navigator.geolocation.watchPosition(function geoPosition(position) {
          if (timeout != null) {
            clearTimeout(timeout);
            timeout = null;
            window.retrieveGeolocationTiming(new Date().getTime() - startTime);
          }
          window.retrieveGeolocation(position);
        }, function handleError(error) {
          if (timeout != null) {
            clearTimeout(timeout);
            timeout = null;
          }
          window.retrieveGeolocationError(error);
        }
        , {enableHighAccuracy: true, timeout: 60000, maximumAge: 60000});
    }
  }, 1)
})();
