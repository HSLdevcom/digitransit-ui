Store = require 'fluxible/addons/BaseStore'

class EndpointStore extends Store
  # Store the user selections for the origin and destination.
  # Both can optionally be set to track the current geolocation.

  @storeName: 'EndpointStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @setOriginToCurrent()
    @clearDestination()

  clearOrigin: () ->
    @origin =
        useCurrentPosition: false
        lat: null
        lon: null
        address: null
    @emitChange()

  clearDestination: () ->
    @destination =
        useCurrentPosition: false
        lat: null
        lon: null
        address: null
    @emitChange()

  swapOriginDestination: () ->
    [@destination, @origin] = [@origin, @destination]
    @emitChange()

  setOriginToCurrent: () ->
    @origin =
        useCurrentPosition: true
        lat: null
        lon: null
        address: null
    @emitChange()

  setDestinationToCurrent: () ->
    @destination =
        useCurrentPosition: true
        lat: null
        lon: null
        address: null
    @emitChange()

  setOrigin: (location) ->
    @origin =
      useCurrentPosition: false
      lat: location.lat
      lon: location.lon
      address: location.address
    @emitChange("set-origin")

  setDestination: (location) ->
    @destination =
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

module.exports = EndpointStore
