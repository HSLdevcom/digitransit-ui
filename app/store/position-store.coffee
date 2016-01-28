Store = require 'fluxible/addons/BaseStore'

class PositionStore extends Store

  STATUS_NO_LOCATION: 'no-location'
  STATUS_SEARCHING_LOCATION: 'searching-location'
  STATUS_FOUND_LOCATION: 'found-location'
  STATUS_FOUND_ADDRESS: 'found-address'
  STATUS_GEOLOCATION_DENIED: 'geolocation-denied'
  STATUS_GEOLOCATION_TIMEOUT: 'geolocation-timeout'
  STATUS_GEOLOCATION_NOT_SUPPORTED: 'geolocation-not-supported'

  @storeName: 'PositionStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @removeLocation()

  removeLocation: () ->
    @lat = 0
    @lon = 0
    @heading = null
    @address = ''
    @status = @STATUS_NO_LOCATION
    @emitChange()

  geolocationSearch: () ->
    @status = @STATUS_SEARCHING_LOCATION
    @address = ''
    @emitChange()

  geolocationNotSupported: () ->
    @status = @STATUS_GEOLOCATION_NOT_SUPPORTED
    @emitChange()

  geolocationDenied: () ->
    @status = @STATUS_GEOLOCATION_DENIED
    @emitChange()

  geolocationTimeout: () ->
    @status = @STATUS_GEOLOCATION_TIMEOUT
    @emitChange()

  storeLocation: (location) ->
    statusChanged = @hasStatusChanged(true)
    @lat = location.lat
    @lon = location.lon
    @heading = if location.heading then location.heading else @heading
    @status = @STATUS_FOUND_LOCATION
    @emitChange(statusChanged: statusChanged)

  storeAddress: (location) ->
    @address = "#{location.address} #{location.number}, #{location.city}"
    @status = @STATUS_FOUND_ADDRESS
    @emitChange()

  hasStatusChanged: (hasLocation) =>
    return hasLocation != @getLocationState().hasLocation

  storeLocationAndAddress: (location) ->
    @lat = location.lat
    @lon = location.lon
    @address = location.address
    @status = @STATUS_FOUND_ADDRESS
    @emitChange()

  getLocationState: () ->
    lat: @lat
    lon: @lon
    address: @address
    status: @status
    hasLocation: @status == @STATUS_FOUND_ADDRESS or @status == @STATUS_FOUND_LOCATION
    # Locationing is in progress when browser is:
    #   searching address or
    #   reverse geocoding is in progress
    isLocationingInProgress: @status == @STATUS_SEARCHING_LOCATION

  getLocationString: () ->
    "#{@address}::#{@lat},#{@lon}"

  storeWatchId: (watchId) ->
    @watchId = watchId

  clearWatchId: ->
    @watchId = undefined

  getWatchId: ->
    @watchId

  @handlers:
    "GeolocationSearch": 'geolocationSearch'
    "GeolocationFound": 'storeLocation'
    "GeolocationRemoved": 'removeLocation'
    "GeolocationNotSupported": 'geolocationNotSupported'
    "GeolocationDenied": 'geolocationDenied'
    "GeolocationTimeout": 'geolocationTimeout'
    "ManuallySetPosition": 'storeLocationAndAddress'
    "AddressFound": 'storeAddress'
    "GeolocationWatchStarted": 'storeWatchId'
    "GeolocationWatchStopped": 'clearWatchId'

module.exports = PositionStore
