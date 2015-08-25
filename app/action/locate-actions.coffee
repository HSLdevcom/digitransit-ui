xhrPromise = require '../util/xhr-promise'
config        = require '../config'


reverseGeocodeAddress = (actionContext, location, done) ->
  xhrPromise.getJson(config.URL.GEOCODER + "reverse/" +
                     location.lat + "," + location.lon).then (data) ->
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
    actionContext.executeAction reverseGeocodeAddress,
      lat: position.coords.latitude
      lon: position.coords.longitude
    , done
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

startLocationWatch = (actionContext, payload, done) ->
  # First check if we have geolocation support
  if not navigator.geolocation
    actionContext.dispatch "GeolocationNotSupported"
    done()
    return

  # Set timeout
  timeoutId = window.setTimeout(( -> actionContext.dispatch "GeolocationWatchTimeout"), 10000)

  # and start positioning
  watchId = navigator.geolocation.watchPosition (position) =>
    if timeoutId
      window.clearTimeout(timeoutId)
      timeoutId = undefined
    actionContext.dispatch "GeolocationUpdated",
      lat: position.coords.latitude
      lon: position.coords.longitude
      heading: position.coords.heading
  , (error) =>
    if timeoutId
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
  , enableHighAccuracy: true, timeout: 60000, maximumAge: 0

  actionContext.dispatch "GeolocationWatchStarted", watchId
  done()

stopLocationWatch = (actionContext, payload, done) ->
  navigator.geolocation.clearWatch actionContext.getStore("LocationStore").getWatchId()
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
