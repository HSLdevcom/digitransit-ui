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

  clearOrigin: () =>
    @origin = @getUseCurrent(null, false)
    @emitChange("set-origin")

  clearDestination: () =>
    @destination = @getUseCurrent(null, false)
    @emitChange()

  swapEndpoints: () ->
    [@destination, @origin] = [@origin, @destination]
    @emitChange()

  setOriginToCurrent: () ->
    if @destination.useCurrentPosition == true
      @clearDestination()
    @origin = @getUseCurrent(@origin, true)
    @emitChange("set-origin")

  setDestinationToCurrent: () ->
    if @origin.useCurrentPosition == true
      @clearOrigin()
    @destination = @getUseCurrent(@destination, true)
    @emitChange()

  getUseCurrent: (current, useCurrent) =>
    useCurrentPosition: useCurrent
    userSetPosition: current?.userSetPosition || false
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

  setEndpoint: (props) ->
    {target, value} = props
    if "destination" == target
      @setDestination value
    else
      @setOrigin value

  useCurrentPosition: (target) ->
    if "destination" == target
      @setDestinationToCurrent()
    else
      @setOriginToCurrent()

  @handlers:
    "setEndpoint": "setEndpoint"
    "useCurrentPosition": "useCurrentPosition"
    "swapEndpoints": "swapEndpoints"
    "clearOrigin": "clearOrigin"
    "clearDestination": "clearDestination"
    "GeolocationNotSupported": 'clearGeolocation'
    "GeolocationDenied": 'clearGeolocation'
    "GeolocationTimeout": 'clearGeolocation'
    "clearGeolocation": "clearGeolocation"
    "isCurrentPositionInUse": "isCurrentPositionInUse"

module.exports = EndpointStore
