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

  setOriginToCurrent: () ->
    @origin =
        useCurrentPosition: true

  setDestinationToCurrent: () ->
    @destination =
        useCurrentPosition: true

  setOrigin: (location) ->
    @origin =
        useCurrentPosition: false
        lat: location.lat
        lon: location.lon
        address: location.address
    @emitChange()

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

  @handlers:
    "setOrigin": "setOrigin"
    "setDestination": "setDestination"
    "setOriginToCurrent": "setOriginToCurrent"
    "setDestinationToCurrent": "setDestinationToCurrent"
    "clearOrigin": "clearOrigin"
    "clearDestination": "clearDestination"

module.exports = EndpointStore
