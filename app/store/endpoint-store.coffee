Store = require 'fluxible/addons/BaseStore'

class EndpointStore extends Store
  # Store the user selections for the origin and destination.
  # Both can optionally be set to track the current geolocation.

  @storeName: 'EndpointStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @origin = @getUseCurrent(@origin, true)
    @emitChange("origin-use-current")
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

  # location: {address: 'Rautatioeasema, Helsinki', lat: 60.1710688, lon:24.9414841}
  setOrigin: (location) ->
    @origin =
      userSetPosition: true
      useCurrentPosition: false
      lat: location.lat
      lon: location.lon
      address: location.address
    @pendingPopup = true
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
      @emitChange("origin-use-current")

  isPendingPopup: () =>
    previous = @pendingPopup
    @pendingPopup = false
    previous

  @handlers:
    "setEndpoint": "setEndpoint"
    "useCurrentPosition": "useCurrentPosition"
    "swapEndpoints": "swapEndpoints"
    "clearOrigin": "clearOrigin"
    "clearDestination": "clearDestination"
    "clearGeolocation": "clearGeolocation"

module.exports = EndpointStore
