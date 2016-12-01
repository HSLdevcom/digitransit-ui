window.position = {
  pos: null,
  error: null,
}

window.retrieveGeolocation = function retrieveGeolocation(pos) {
  window.position.pos = pos;
}

window.retrieveGeolocationError = function retrieveGeolocationError(error) {
  window.position.error = error;
}

//set watcher for geolocation
function watchPosition() {
  var startTime = new Date().getTime();
  var quietTimeoutSeconds = 20;

  var timeout = setTimeout(function setTimeout(){
    window.retrieveGeolocationError(
      {code: 100001, message: "No location retrieved for " + quietTimeoutSeconds + " seconds."});
    },
    quietTimeoutSeconds * 1000);
  try {
    window.geoWatchId = navigator.geolocation.watchPosition(function geoPosition(position) {
      if (timeout !== null) {
        clearTimeout(timeout);
        timeout = null;
      }
      window.retrieveGeolocation(position);
    }, function handleError(error) {
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

function startPositioning() {
  if(navigator.permissions !== undefined) {
    //check permission state
    navigator.permissions.query({name:'geolocation'}).then(
      function(permissionStatus){
        if ('prompt' === permissionStatus.state) {
          //it was, let's listen for changes
          function promptChangeHandler() {
            permissionStatus.onchange = null; //remove listener
            if ('granted' === permissionStatus.state) {
              window.retrieveGeolocationError({code: 100000, message: 'Granted'});
            } else if ('denied' === permissionStatus.state) {
              window.retrieveGeolocationError({code: 1, message: 'Denied from prompt'});
            }
          }
          permissionStatus.onchange = promptChangeHandler;
          window.retrieveGeolocationError({code: 100002, message: 'Prompt'});
          watchPosition();
        } else if ('granted' === permissionStatus.state) {
          window.retrieveGeolocationError({code: 100000, message: 'Granted'});
          watchPosition();
        }
        else if ('denied' === permissionStatus.state) {
          window.retrieveGeolocationError({code: 1, message: 'Denied'});
        }
      });
  } else {
    //browsers not supporting permission api
    window.retrieveGeolocationError({code: 100000, message: 'Granted'});
    watchPosition();
  }
}

// Check if we have previous permissions to get geolocation.
// If yes, start immediately, if not, we will not prompt for permission at this point.
setTimeout(function () {

  function getPositioningHasSucceeded() {

    function isWindowsPhone(){
      return navigator && navigator.userAgent.indexOf('Windows Phone') !== -1;
    }

    function isIDeviceApp() {
      return navigator
        && navigator.userAgent
        && (navigator.userAgent.indexOf('iPhone') !==-1 || navigator.userAgent.indexOf('iPad') !==-1)
        && window && window.navigator.standalone;
    }
    //XXX hack for windows phone & safari app mode
    if (isWindowsPhone() || isIDeviceApp()) {
      return JSON.parse(typeof window !== 'undefined' && window.localStorage &&
        window.localStorage.getItem("positioningSuccesful") || '{ "state": false }').state || false;
    }
    return false;
  }

  if (window.location.search.indexOf('mock') === -1 && navigator.geolocation !== undefined && navigator.permissions !== undefined) {
    navigator.permissions.query({name:'geolocation'}).then(
      function(result) {
        if ('granted' === result.state) {
          window.startPositioning();
        }
        if ('denied' === result.state) {
          //for ff with permisson api display error immediately instead of timeout error
          window.retrieveGeolocationError({code: 1, message: 'Denied'});
        }
      }
    );
  } else {
    //broser does not support permission api
    if (getPositioningHasSucceeded()) {
      window.startPositioning();
    }
  }
}, 1);
