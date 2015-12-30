window.retrieveGeolocation = function retrievePos(pos) {
  window.digiTransitPosition = pos;
}

window.retrieveError = function retrieveError(error) {
  window.digiTransitPositionError = error;
}

if(window.location.search.indexOf('mock') === -1){
  window.geoWatchId = navigator.geolocation.watchPosition(function geoPosition(position) {
      window.retrieveGeolocation(position);
    }, function handleError(error) {
      retrieveError(error);
    }
    , {enableHighAccuracy: true, timeout: 60000, maximumAge: 60000});
}