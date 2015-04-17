Dispatcher = require('../dispatcher/dispatcher.coffee')
Store = require('./store.coffee')

class LocationStore extends Store

  STATUS_NO_LOCATION: 'no-location'
  STATUS_SEARCHING_LOCATION: 'searching-location'
  STATUS_FOUND_LOCATION: 'found-location'
  STATUS_FOUND_ADDRESS: 'found-location'
  STATUS_GEOLOCATION_DENIED: 'geolocation-denied'
  STATUS_GEOLOCATION_NOT_SUPPORTED: 'geolocation-not-supported'

  constructor: ->
    super()
    @removeLocation()
    @register()

  removeLocation: () ->
    @lat = 0
    @lon = 0
    @address = ''
    @status = @STATUS_NO_LOCATION
    @emitChanges()

  geolocationSearch: () ->
    @status = @STATUS_SEARCHING_LOCATION
    @emitChanges()

  geolocationNotSupported: () ->
    @status = @STATUS_GEOLOCATION_NOT_SUPPORTED
    @emitChanges()

  geolocationDenied: () ->
    @status = @STATUS_GEOLOCATION_DENIED
    @emitChanges()

  storeLocation: (lat, lon) ->
    @lat = lat
    @lon = lon
    @status = @STATUS_FOUND_LOCATION
    @emitChanges()

  storeAddress: (address, number) ->
    @address = address + " " + number
    @status = @STATUS_FOUND_ADDRESS
    @emitChanges()

  getLocationState: () ->
    lat: @lat
    lon: @lon
    address: @address
    status: @status

  register: -> 
    @dispatchToken = Dispatcher.register (action) => 
      switch action.actionType
        when "GeolocationSearch" then @geolocationSearch()
        when "GeolocationFound" then @storeLocation(action.lat, action.lon)
        when "GeolocationRemoved" then @removeLocation()
        when "GeolocationNotSupported" then @geolocationNotSupported()
        when "GeolocationDenied" then @geolocationDenied()
        when "ManuallySetPosition" then @storeLocation(action.lat, action.lon)
        when "AddressFound" then @storeAddress(action.address, action.number)
      
module.exports = new LocationStore()