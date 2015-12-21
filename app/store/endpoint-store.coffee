Store = require 'fluxible/addons/BaseStore'

class EndpointStore extends Store
  # Store the user selections for the origin and destination.
  # Both can optionally be set to track the current geolocation.

  @storeName: 'EndpointStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @originFocusRequired = false
    @destinationFocusRequired = false
    @origin = @getUseCurrent(@origin, true)
    @destination = @getUseCurrent(@destination, false)

  isCurrentPositionInUse: () ->
    @origin.useCurrentPosition || @destination.useCurrentPosition

  clearOrigin: () ->
#    console.log("clear origin")
    if @origin?.userSetPosition && @origin.address?.length > 0
      @origin = @getUseCurrent(@origin, false)
      @emitChange("set-origin")

  clearDestination: () =>
    if @destination?.userSetPosition && @destination.address?.length > 0
      @destination = @getUseCurrent(@destination, false)
      @emitChange()

  swapOriginDestination: () ->
#    console.log("swap")
    [@destination, @origin] = [@origin, @destination]
    @emitChange()

  setOriginToCurrent: () ->
#    console.log("set origin to current")
    @origin = @getUseCurrent(@origin, true)
    @emitChange("set-origin")

  setDestinationToCurrent: () ->
    @destination = @getUseCurrent(@destination, true)
    @emitChange()

  getUseCurrent: (current, useCurrent) =>
    useCurrentPosition: useCurrent
    userSetPosition: current?.userSetPosition || false
    lat: null
    lon: null
    address: null

  setOrigin: (location) ->
#    console.log("setOrigin")
    @origin =
      userSetPosition: true
      useCurrentPosition: false
      lat: location.lat
      lon: location.lon
      address: location.address
    @emitChange("set-origin")

  enableOriginInputMode: () =>
#    console.log("enable origin input mode")
    @originFocusRequired = true
    @enable(@origin)

  disableOriginInputMode: () ->
    if @origin.address == ""
      @origin.userSetPosition = false
      @emitChange()

  enableDestinationInputMode: () ->
    @destinationFocusRequired = true
    @enable(@destination)

  enable: (t) ->
    t.userSetPosition = true
    t.useCurrentPosition = false
    @emitChange()

  isOriginFocus: () =>
    focus = @originFocusRequired
    @originFocusRequired = false
    focus

  isDestinationFocus: () =>
    focus = @destinationFocusRequired
    @destinationFocusRequired = false
    focus

  disableDestinationInputMode: () ->
    if @destination.address == ""
      @destination.userSetPosition = false
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
      @origin = @getUseCurrent(@origin, false)
    if @destination.useCurrentPosition
      @destination = @getUseCurrent(@destination, false)
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
    "GeolocationNotSupported": 'clearGeolocation'
    "GeolocationDenied": 'clearGeolocation'
    "GeolocationTimeout": 'clearGeolocation'
    "clearGeolocation": "clearGeolocation"
    "isCurrentPositionInUse": "isCurrentPositionInUse"
    "enableOriginInputMode": "enableOriginInputMode"
    "disableOriginInputMode": "disableOriginInputMode"
    "enableDestinationInputMode": "enableDestinationInputMode"
    "disableDestinationInputMode": "disableDestinationInputMode"
    "isDestinationFocus": "isDestinationFocus"
    "isOriginFocus": "isOriginFocus"


module.exports = EndpointStore
