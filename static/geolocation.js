window.position = {
  pos: null,
  error: null,
  timing: null
}

window.retrieveGeolocation = function retrieveGeolocation(pos) {
  console.log("retrieve position", pos);
  window.position.pos = pos;
}

window.retrieveGeolocationError = function retrieveGeolocationError(error) {
  console.log("retrieve error", error);
  window.position.error = error;
}

window.retrieveGeolocationTiming = function retrieveGeolocationTiming(timing) {
  window.position.timing = timing;
}

function startPositioning() {
  console.log("startiong geolocation watch...");
  var startTime = new Date().getTime();
  var quietTimeoutSeconds = 20;

  //timeout timer for geolocation
  var timeout = setTimeout(function () {
    window.retrieveGeolocationError(
      {code: 100001, message: "No location retrieved for " + quietTimeoutSeconds + " seconds."});
    },
    quietTimeoutSeconds * 1000);

  console.log("adding watch...");
  window.geoWatchId = navigator.geolocation.watchPosition(function geoPosition(position) {
    if (timeout != null) {
      clearTimeout(timeout);
      timeout = null;

      window.retrieveGeolocationTiming(new Date().getTime() - startTime);
    }
        console.log("retrieving geolocation...", position);
    window.retrieveGeolocation(position);
  }, function handleError(error) {
    if (timeout != null) {
      clearTimeout(timeout);
      timeout = null;
      console.log("geolocationerror", error);
    }
    window.retrieveGeolocationError(error);
  }
  , {enableHighAccuracy: true, timeout: 60000, maximumAge: 60000});
}

// Check if we have previous permissions to get geolocation.
// If yes, start immediately, if not, we will not prompt for permission at this point.
(function() {
  setTimeout(function () {
    if (window.location.search.indexOf('mock') === -1 && navigator.geolocation !== undefined) {
      console.log(navigator.permissions);
      navigator.permissions.query({name:'geolocation'}).then(
        function(result) {
          console.log("geolocation permission result", result)
          if (result.state === 'granted') {
            window.startPositioning();
          } else if (result.state === 'prompt') {
          } else if (result.state === 'denied') {
            window.retrieveGeolocationError({code:1}); //user has denied geolocation, cannot fix until user changes settings...
          }
        }
      );
    }
  }, 1);
})();
