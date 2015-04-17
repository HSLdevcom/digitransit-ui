Dispatcher = require '../dispatcher/dispatcher.coffee'

class LocateActions

  findLocation: ->
    # First check if we have geolocation support
    if not navigator.geolocation
      Dispatcher.dispatch
        actionType: "GeolocationNotSupported"
      return 

    # Notify that we are searching...
    Dispatcher.dispatch
      actionType: "GeolocationSearch"

    # and start positioning
    navigator.geolocation.getCurrentPosition (position) -> 
        Dispatcher.dispatch
          actionType: "GeolocationFound"
          lat: position.coords.latitude
          lon: position.coords.longitude
    , (error) ->
      Dispatcher.dispatch
        actionType: "GeolocationDenied"

  removeLocation: ->
    Dispatcher.dispatch
      actionType: "GeolocationRemoved"

  manuallySetPosition: (lat, lon) ->
    Dispatcher.dispatch
      actionType: "ManuallySetPosition"
      lat: lat
      lon: lon


module.exports = new LocateActions