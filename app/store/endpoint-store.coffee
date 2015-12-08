Store = require 'fluxible/addons/BaseStore'

class EndpointStore extends Store
  # Store the user selections for the origin and destination.
  # Both can optionally be set to track the current geolocation.

  @storeName: 'EndpointStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @setOriginToCurrent()
    @clearDestination()

  isCurrentPositionInUse: () ->
    a = @origin.useCurrentPosition || @destination.useCurrentPosition
    console.log("is currentPosition in use:", a);
    a

  clearOrigin: () ->
    @origin = @getUseCurrent(false)
    @emitChange('origin')

  clearDestination: () ->
    @destination = @getUseCurrent(false);
    @emitChange('destination')

  swapOriginDestination: () ->
    console.log("store swapping!")
    [@destination, @origin] = [@origin, @destination]
    @emitChange()

  setOriginToCurrent: () ->
    #todo should toggle useCurrent from destination?
    @origin = @getUseCurrent(true)
    @emitChange()

  setDestinationToCurrent: () ->
    #todo should toggle useCurrent from origin?
    @destination = @getUseCurrent(true)
    @emitChange()

  getUseCurrent: (useCurrent) ->
    useCurrentPosition: useCurrent
    userSetPosition: false
    lat: null
    lon: null
    address: null

  setOrigin: (location) ->
    @origin =
      userSetPosition: true
      useCurrentPosition: false
      lat: location.lat
      lon: location.lon
      address: location.address
    @emitChange("set-origin")

  enableOriginInputMode: () ->
    console.log "enable origin input"
    @origin.userSetPosition = true
    @origin.useCurrentPosition = false
    @emitChange()

  disableOriginInputMode: () ->
    console.log "disable origin input"
    @origin.userSetPosition = false
    @emitChange()

  setDestination: (location) ->
    @destination =
      userSetPosition: true
      useCurrentPosition: false
      lat: location.lat
      lon: location.lon
      address: location.address
    @emitChange()

  getOrigin: () ->
    @origin

  getDestination: () ->
    @destination

  clearGeolocation: () ->
    if @origin.useCurrentPosition
      @clearOrigin()
    if @destination.useCurrentPosition
      @clearDestination()

  dehydrate: ->
    {@origin, @destination}

  rehydrate: (data) ->
    @origin = data.origin
    @destination = data.destination


  @handlers:
    "setOrigin": "setOrigin"
    "setDestination": "setDestination"
    "setOriginToCurrent": "setOriginToCurrent"
    "setDestinationToCurrent": "setDestinationToCurrent"
    "swapOriginDestination": "swapOriginDestination"
    "clearOrigin": "clearOrigin"
    "clearDestination": "clearDestination"
    "GeolocationNotSupported": "clearGeolocation"
    "GeolocationDenied": "clearGeolocation"
    "GeolocationTimeout": "clearGeolocation"
    "clearGeolocation": "clearGeolocation"
    "isCurrentPositionInUse": "isCurrentPositionInUse"
    "enableOriginInputMode": "enableOriginInputMode"
    "disableOriginInputMode": "disableOriginInputMode"

module.exports = EndpointStore
