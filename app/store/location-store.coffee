Dispatcher = require('../dispatcher/dispatcher.coffee')
Store = require('./store.coffee')

class LocationStore extends Store

  STATUS_NO_LOCATION: 'no-location'
  STATUS_FOUND_LOCATION: 'found-location'

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

  storeLocation: (lat, lon) ->
    @lat = lat
    @lon = lon
    @address='Opastinsilta 6a'
    @status = @STATUS_FOUND_LOCATION
    @emitChanges()

  getLocationState: () ->
    lat: @lat
    lon: @lon
    address: @address
    status: @status

  register: -> 
    @dispatchToken = Dispatcher.register (action) => 
      switch action.actionType
        when "GeolocationFound" then @storeLocation(action.lat, action.lon)
        when "GeolocationRemoved" then @removeLocation()
        when "GeolocationNotSupported" then console.log("geolocation not supported")
        when "GeolocationDenied" then console.log("geolocation denied")
      
module.exports = new LocationStore()