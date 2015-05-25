xhrPromise = require '../util/xhr-promise'
executeMultiple = require 'fluxible-action-utils/async/executeMultiple'
NearestStopsActions = require './nearest-stops-action'
StopDeparturesActions = require './stop-departures-action'
config        = require '../config'


reverseGeocodeAddress = (actionContext, location, done) ->
  xhrPromise.getJson(config.URL.GEOCODER + "reverse/" + location.lat + "," + location.lon).then (data) ->
      actionContext.dispatch "AddressFound",
        address: data.katunimi
        number: data.osoitenumero
        city: data.kaupunki
      done()

findLocation = (actionContext, payload, done) ->
  # First check if we have geolocation support
  if not navigator.geolocation
    actionContext.dispatch "GeolocationNotSupported"
    done()
    return

  # Notify that we are searching...
  actionContext.dispatch "GeolocationSearch"

  # Set timeout

  timeoutId = window.setTimeout(( -> actionContext.dispatch "GeolocationTimeout"), 10000)

  # and start positioning
  navigator.geolocation.getCurrentPosition (position) => 
    window.clearTimeout(timeoutId)
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
        action: StopDeparturesActions.fetchStopsDepartures
        params:
          from: 0
          to: 10 ]
    , () -> done()
  , (error) =>
    window.clearTimeout(timeoutId)
    if error.code == 1
      actionContext.dispatch "GeolocationDenied"
    else if error.code == 2
      actionContext.dispatch "GeolocationNotSupported"
    else if error.code == 2
      actionContext.dispatch "GeolocationTimeout"
    else # When could this happen?
      actionContext.dispatch "GeolocationNotSupported"
    done()
  , enableHighAccuracy: true, timeout: 10000, maximumAge: 60000

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
      action: StopDeparturesActions.fetchStopsDepartures
      params:
          from: 0
          to: 10 ]
  , () -> done()

module.exports =
  'findLocation':          findLocation
  'removeLocation':        removeLocation
  'manuallySetPosition':   manuallySetPosition
  'reverseGeocodeAddress': reverseGeocodeAddress