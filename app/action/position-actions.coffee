xhrPromise = require '../util/xhr-promise'
config     = require '../config'
debounce   = require 'lodash/debounce'
inside     = require 'point-in-polygon'
itinerarySearchActions = require './itinerary-search-action'

geolocator = (actionContext) ->
  actionContext.getStore('ServiceStore').geolocator()

module.exports.reverseGeocodeAddress = reverseGeocodeAddress = (actionContext, location, done) ->

  language = actionContext.getStore('PreferencesStore').getLanguage()

  xhrPromise.getJson(config.URL.PELIAS_REVERSE_GEOCODER,
      "point.lat": location.lat
      "point.lon": location.lon
      lang: language
      size: 1
  ).then (data) ->
    if data.features? && data.features.length > 0
      match = data.features[0].properties
      actionContext.dispatch "AddressFound",
        address: match.street
        number: match.housenumber
        city: match.locality
    done()

module.exports.findLocation = (actionContext, payload, done) ->
  # First check if we have geolocation support
  if not geolocator(actionContext).geolocation
    actionContext.dispatch "GeolocationNotSupported"
    return done()

  broadcastCurrentLocation(actionContext)
  done()

runReverseGeocodingAction = (actionContext, lat, lon, done) ->
  actionContext.executeAction reverseGeocodeAddress,
    lat: lat
    lon: lon
  , done

debouncedRunReverseGeocodingAction = debounce(runReverseGeocodingAction, 60000, {leading: true})

setCurrentLocation = (pos) =>
  isFirst =  pos && @position == undefined
  if inside([pos.lon, pos.lat], config.areaPolygon)
    @position = pos
  else
    @position =
      lat: config.defaultPosition[0]
      lon: config.defaultPosition[1]
      heading: pos.heading
  isFirst

broadcastCurrentLocation = (actionContext) =>
  if @position
    actionContext.dispatch "GeolocationFound", @position

module.exports.startLocationWatch = (actionContext, payload, done) ->
  # First check if we have geolocation support
  if not geolocator(actionContext).geolocation
    actionContext.dispatch "GeolocationNotSupported"
    done()
    return

  # Notify that we are searching...
  actionContext.dispatch "GeolocationSearch"

  # Set timeout
  timeoutId = window.setTimeout(( -> actionContext.dispatch "GeolocationWatchTimeout"), 10000)

  ##re define function to retrieve position updates (geolocation.js/mock)
  window.retrieveGeolocation = (position) ->

    if window.position.pos != null
      window.position.pos = null
    if timeoutId
      window.clearTimeout(timeoutId)
      timeoutId = undefined
    isFirst = setCurrentLocation
      lat: position.coords.latitude
      lon: position.coords.longitude
      heading: position.coords.heading

    broadcastCurrentLocation actionContext
    if(isFirst)
      actionContext.executeAction(itinerarySearchActions.route, undefined, (e) =>
        if e
          console.error "Could not route:", e
      )

    debouncedRunReverseGeocodingAction actionContext, position.coords.latitude, position.coords.longitude, done

  ##re define function to retrieve position errors (geolocation.js)
  window.retrieveError = (error) ->
    if error
      if error.code == 1
        actionContext.dispatch "GeolocationDenied"
      else if error.code == 2
        actionContext.dispatch "GeolocationNotSupported"
      else if error.code == 3
        actionContext.dispatch "GeolocationTimeout"
      window.position.error = null

  if window.position.error != null
    window.retrieveError window.position.error
    window.position.error = null

  if window.position.pos != null
    window.retrieveGeolocation window.position.pos
    window.position.pos = null
  done()

module.exports.removeLocation = (actionContext) ->
  actionContext.dispatch "GeolocationRemoved"
