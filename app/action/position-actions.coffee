xhrPromise = require '../util/xhr-promise'
config     = require '../config'
debounce   = require 'lodash/function/debounce'

geolocator = (actionContext) ->
  actionContext.getStore('ServiceStore').geolocator()

reverseGeocodeAddress = (actionContext, location, done) ->

  xhrPromise.getJson(config.URL.PELIAS_REVERSE_GEOCODER +
      "?point.lat=" + location.lat +
      "&point.lon=" + location.lon +
      "&size=1"
  ).then (data) ->
    if data.features? && data.features.length > 0
      match = data.features[0].properties
      actionContext.dispatch "AddressFound",
        address: match.street
        number: match.housenumber
        city: match.locality
    done()

findLocation = (actionContext, payload, done) ->
  # First check if we have geolocation support
  if not geolocator(actionContext).geolocation
    actionContext.dispatch "GeolocationNotSupported"
    done()
    return

  # Notify that we are searching...
  actionContext.dispatch "GeolocationSearch"

  # Set timeout

  timeoutId = window.setTimeout(( -> actionContext.dispatch "GeolocationTimeout"), 10000)

  # and start positioning
  geolocator(actionContext).geolocation.getCurrentPosition (position) =>
    window.clearTimeout(timeoutId)
    actionContext.dispatch "GeolocationFound",
      lat: position.coords.latitude
      lon: position.coords.longitude
    runReverseGeocodingAction actionContext, position.coords.latitude, position.coords.longitude, done
  , (error) =>
    window.clearTimeout(timeoutId)
    if error.code == 1
      actionContext.dispatch "GeolocationDenied"
    else if error.code == 2
      actionContext.dispatch "GeolocationNotSupported"
    else if error.code == 3
      actionContext.dispatch "GeolocationTimeout"
    else # When could this happen?
      actionContext.dispatch "GeolocationNotSupported"
    done()
  , enableHighAccuracy: true, timeout: 10000, maximumAge: 60000


runReverseGeocodingAction = (actionContext, lat, lon, done) ->
  actionContext.executeAction reverseGeocodeAddress,
    lat: lat
    lon: lon
  , done

debouncedRunReverseGeocodingAction = debounce(runReverseGeocodingAction, 60000, {leading: true})

startLocationWatch = (actionContext, payload, done) ->
  # First check if we have geolocation support
  if not geolocator(actionContext).geolocation
    actionContext.dispatch "GeolocationNotSupported"
    done()
    return

  # Notify that we are searching...
  actionContext.dispatch "GeolocationSearch"

  # Set timeout
  timeoutId = window.setTimeout(( -> actionContext.dispatch "GeolocationWatchTimeout"), 10000)

  # and start positioning
  watchId = geolocator(actionContext).geolocation.watchPosition (position) =>
    if timeoutId
      window.clearTimeout(timeoutId)
      timeoutId = undefined
    actionContext.dispatch "GeolocationFound",
      lat: position.coords.latitude
      lon: position.coords.longitude
      heading: position.coords.heading

    debouncedRunReverseGeocodingAction actionContext, position.coords.latitude, position.coords.longitude, done
  , (error) =>
    if timeoutId
      window.clearTimeout(timeoutId)
    if error.code == 1
      actionContext.dispatch "GeolocationDenied"
    else if error.code == 2
      actionContext.dispatch "GeolocationNotSupported"
    else if error.code == 3
      actionContext.dispatch "GeolocationTimeout"
    else # When could this happen?
      actionContext.dispatch "GeolocationNotSupported"
    done()
  , enableHighAccuracy: true, timeout: 60000, maximumAge: 0

  actionContext.dispatch "GeolocationWatchStarted", watchId
  done()

stopLocationWatch = (actionContext, payload, done) ->
  geolocator(actionContext).geolocation.clearWatch actionContext.getStore("PositionStore").getWatchId()
  actionContext.dispatch "GeolocationWatchStopped"
  done()

removeLocation = (actionContext) ->
  actionContext.dispatch "GeolocationRemoved"

manuallySetPosition = (actionContext, location, done) ->
  actionContext.dispatch "ManuallySetPosition",
    lat: location.lat
    lon: location.lon
    address: location.address
  done()

module.exports =
  'findLocation': findLocation
  'removeLocation': removeLocation
  'manuallySetPosition': manuallySetPosition
  'reverseGeocodeAddress': reverseGeocodeAddress
  'startLocationWatch': startLocationWatch
  'stopLocationWatch': stopLocationWatch
