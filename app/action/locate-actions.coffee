$          = require 'jquery'

reverseGeocodeAddress = (actionContext, location, done) ->
  $.getJSON "http://matka.hsl.fi/geocoder/reverse/" + location.lat + "," + location.lon, (data) ->
      actionContext.dispatch "AddressFound",
        address: data.katunimi
        number: data.osoitenumero
      done()

findLocation = (actionContext, payload, done) ->
  # First check if we have geolocation support
  if not navigator.geolocation
    actionContext.dispatch "GeolocationNotSupported"
    done()
    return

  # Notify that we are searching...
  actionContext.dispatch "GeolocationSearch"

  # and start positioning
  navigator.geolocation.getCurrentPosition (position) => 
      actionContext.dispatch "GeolocationFound",
        lat: position.coords.latitude
        lon: position.coords.longitude
      actionContext.executeAction reverseGeocodeAddress, ('lat': position.coords.latitude, 'lon': position.coords.longitude), done
  , (error) ->
    actionContext.dispatch "GeolocationDenied"
    done()

removeLocation = (actionContext) ->
  actionContext.dispatch "GeolocationRemoved"

manuallySetPosition = (actionContext, location, done) ->
  actionContext.dispatch "ManuallySetPosition",
    lat: location.lat
    lon: location.lon
    address: location.address

module.exports =
  'findLocation':          findLocation
  'removeLocation':        removeLocation
  'manuallySetPosition':   manuallySetPosition
  'reverseGeocodeAddress': reverseGeocodeAddress