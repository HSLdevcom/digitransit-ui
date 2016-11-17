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

// for prompt/positioning detection
function clearTimeout2(){
  if (timeout2 !== null) {
    clearTimeout(timeout2);
    timeout2 = null;
  }
}

let timeout2;

function startPositioning() {
  var startTime = new Date().getTime();
  var quietTimeoutSeconds = 20;

  //timeout for prompt/positioning detection
  if(navigator.permissions !== undefined) {
    timeout2 = setInterval(function () {

    //check if permission prompt is active
    navigator.permissions.query({name:'geolocation'}).then(
        function(result){
          if (result.state === 'prompt') {
            window.retrieveGeolocationError({code: 100002, message: "Prompt"});
          } else if (result.state === 'granted') {
            window.retrieveGeolocationError({code: 100000, message: "Granted"});
            clearTimeout2();
          }
        });
  },1000);
} else {
  window.retrieveGeolocationError({code: 100000, message: "Granted"});
}

  //timeout timer for geolocation
  var timeout = setTimeout(()=>{
    clearTimeout2();
    window.retrieveGeolocationError(
      {code: 100001, message: "No location retrieved for " + quietTimeoutSeconds + " seconds."});
    },
    quietTimeoutSeconds * 1000);


  try {
    window.geoWatchId = navigator.geolocation.watchPosition(function geoPosition(position) {
      clearTimeout2();

      if (timeout !== null) {
        clearTimeout(timeout);
        timeout = null;
        window.retrieveGeolocationTiming(new Date().getTime() - startTime);
      }
      window.retrieveGeolocation(position);
    }, function handleError(error) {
      clearTimeout2();
      if (timeout !== null) {
        clearTimeout(timeout);
        timeout = null;
      }
      window.retrieveGeolocationError(error);
    }
    , {enableHighAccuracy: true, timeout: 60000, maximumAge: 60000});
  } catch (Error) {
    console.log("Error starting geolocation", Error);
  }
}

// Check if we have previous permissions to get geolocation.
// If yes, start immediately, if not, we will not prompt for permission at this point.
(function() {
  setTimeout(function () {
    if (window.location.search.indexOf('mock') === -1 && navigator.geolocation !== undefined && navigator.permissions !== undefined) {
      navigator.permissions.query({name:'geolocation'}).then(
        function(result) {
          if (result.state === 'granted') {
            window.startPositioning();
          } else if (result.state === 'prompt') {
          } else if (result.state === 'denied') {
          }
        }
      );
    }
  }, 1);
})();
