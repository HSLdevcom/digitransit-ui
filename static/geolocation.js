
console.log("starting initial js positioning", new Date().getTime());


window.retrieveGeolocation = function retrievePos(pos) {
  console.log("initial handler", pos);
  window.digiTransitPosition = pos;
}

//todo check mock
window.geoWatchId = navigator.geolocation.watchPosition(function geoPosition(position) {
    console.log("Got pos:", position);
    window.retrieveGeolocation(position);
  }, function handleError(error) {
    if (error.code === 1)
      console.log("geocoder denied");
    else if (error.code === 2) {
      console.log("geolocation not supported")
    }
    else if (error.code === 3) {
      console.log("geolocation timeout")
    }
  }
  , {enableHighAccuracy: true, timeout: 60000, maximumAge: 0});
