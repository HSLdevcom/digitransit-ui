Store = require 'fluxible/addons/BaseStore'

class EndpointStore extends Store
  # Store the user selections for the origin and destination.
  # Both can optionally be set to track the current geolocation.

  @storeName: 'EndpointStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @clearOrigin()
    @clearDestination()

  clearOrigin: () ->
    @origin = null
    @emitChange()

  clearDestination: () ->
    @destination = null
    @emitChange()

  setOriginToCurrent: () ->
    @origin =
        useCurrentPosition: true

  setDestinationToCurrent: () ->
    @destination =
        useCurrentPosition: true

  storeOrigin: (location) ->
    @origin =
        useCurrentPosition: false
        lat: location.lat
        lon: location.lon
        address: "#{location.address} #{location.number}, #{location.city}"
    @emitChange()

  storeDestination: (location) ->
    @destination =
        useCurrentPosition: false
        lat: location.lat
        lon: location.lon
        address: "#{location.address} #{location.number}, #{location.city}"
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

module.exports = EndpointStore
