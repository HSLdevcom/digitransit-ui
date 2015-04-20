Dispatcher = require '../dispatcher/dispatcher.coffee'
$          = require 'jquery'

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
    navigator.geolocation.getCurrentPosition (position) => 
        Dispatcher.dispatch
          actionType: "GeolocationFound"
          lat: position.coords.latitude
          lon: position.coords.longitude
        @reverseGeocodeAddress(position.coords.latitude, position.coords.longitude)
    , (error) ->
      Dispatcher.dispatch
        actionType: "GeolocationDenied"

  removeLocation: ->
    Dispatcher.dispatch
      actionType: "GeolocationRemoved"

  manuallySetPosition: (lat, lon, address) ->
    Dispatcher.dispatch
      actionType: "ManuallySetPosition"
      lat: lat
      lon: lon
      address: address

  reverseGeocodeAddress: (lat, lon) ->
    $.getJSON "http://matka.hsl.fi/geocoder/reverse/" + lat + "," + lon, (data) ->
        Dispatcher.dispatch
          actionType: "AddressFound"
          address: data.katunimi
          number: data.osoitenumero


module.exports = new LocateActions