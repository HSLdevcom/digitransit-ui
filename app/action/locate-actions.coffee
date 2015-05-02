$          = require 'jquery'
executeMultiple = require 'fluxible-action-utils/async/executeMultiple'
NearestStopsActions = require './nearest-stops-action'
StopDeparturesActions = require './stop-departures-action'


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
    executeMultiple actionContext,
      reverseGeocode:
        action: reverseGeocodeAddress
        params:
          lat: position.coords.latitude
          lon: position.coords.longitude
      nearestStops:
        action: NearestStopsActions.nearestStopsRequest
        params:
          lat: position.coords.latitude
          lon: position.coords.longitude
      nearestStopsDepartures: ['nearestStops',
        action: StopDeparturesActions.fetchInitialStops
        params: {} ]
    , () -> done()
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
  executeMultiple actionContext,
    nearestStops:
      action: NearestStopsActions.nearestStopsRequest
      params:
        lat: location.lat
        lon: location.lon
    nearestStopsDepartures: ['nearestStops',
      action: StopDeparturesActions.fetchInitialStops
      params: {} ]
  , () -> done()

module.exports =
  'findLocation':          findLocation
  'removeLocation':        removeLocation
  'manuallySetPosition':   manuallySetPosition
  'reverseGeocodeAddress': reverseGeocodeAddress