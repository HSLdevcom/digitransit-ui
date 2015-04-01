Dispatcher = require('../dispatcher/dispatcher.coffee');

class LocateActions

  findLocation: ->
    if navigator.geolocation
      navigator.geolocation.getCurrentPosition (position) -> 
          Dispatcher.dispatch
            actionType: "GeolocationFound"
            lat: position.coords.latitude
            lon: position.coords.longitude
      , (error) ->
        Dispatcher.dispatch(actionType: "GeolocationDenied")  
    else  
      Dispatcher.dispatch(actionType: "GeolocationNotSupported")

  removeLocation: ->
    Dispatcher.dispatch(actionType: "GeolocationRemoved")

module.exports = new LocateActions