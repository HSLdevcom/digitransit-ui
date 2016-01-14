window.position={
  pos: null,
  error: null
}

window.retrieveGeolocation = function retrievePos(pos) {
  window.position.pos=pos;
}

window.retrieveError = function retrieveError(error) {
  window.position.error = error;
}

setTimeout(function() {
  if(window.location.search.indexOf('mock') === -1 && navigator.geolocation !== undefined){
    window.geoWatchId = navigator.geolocation.watchPosition(function geoPosition(position) {
        window.retrieveGeolocation(position);
      }, function handleError(error) {
        window.retrieveError(error);
      }
      , {enableHighAccuracy: true, timeout: 60000, maximumAge: 60000});
  }
}, 1)
