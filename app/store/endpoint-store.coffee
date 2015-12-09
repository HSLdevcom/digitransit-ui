Store = require 'fluxible/addons/BaseStore'

class EndpointStore extends Store
  # Store the user selections for the origin and destination.
  # Both can optionally be set to track the current geolocation.

  @storeName: 'EndpointStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @origin = @getUseCurrent(true)
    @destination = @getUseCurrent(false)

  isCurrentPositionInUse: () ->
    @origin.useCurrentPosition || @destination.useCurrentPosition

  clearOrigin: () ->
    if @origin?.userSetPosition && @origin.address?.length > 0
      @origin = @getUseCurrent(false)
      @emitChange()

  clearDestination: () =>
    if @destination?.userSetPosition && @destination.address?.length > 0
      @destination = @getUseCurrent(false)
      @emitChange()

  swapOriginDestination: () ->
    [@destination, @origin] = [@origin, @destination]
    @emitChange()

  setOriginToCurrent: () ->
    @origin = @getUseCurrent(true)
    @emitChange()

  setDestinationToCurrent: () ->
    @destination = @getUseCurrent(true)
    @emitChange()

  getUseCurrent: (useCurrent) =>
    useCurrentPosition: useCurrent
    userSetPosition: @destination?.userSetPosition || false
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
    @emitChange()

  enableOriginInputMode: () ->
    @enable(@origin)

  disableOriginInputMode: () ->
    @origin.userSetPosition = false
    @origin.address = ""
    @emitChange()

  enableDestinationInputMode: () ->
    @enable(@destination)

  enable: (t) ->
    t.userSetPosition = true
    t.useCurrentPosition = false
    @emitChange()

  disableDestinationInputMode: () ->
    @destination.userSetPosition = false
    @destination.address = ""
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
      @origin.useCurrentPosition = false
    if @destination.useCurrentPosition
      @destination.useCurrentPosition = false
    @emitChange()

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
    "enableDestinationInputMode": "enableDestinationInputMode"
    "disableDestinationInputMode": "disableDestinationInputMode"

module.exports = EndpointStore
