Store = require 'fluxible/addons/BaseStore'

class StopInformationStore extends Store
  @storeName: 'StopInformationStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @stops = {}
    @routes = {}

  getStop: (id) =>
    @stops[id]

  getRoutes: (id) =>
    @routes[id]

  storeStopInformation: (data) ->
    @stops[data.id] = data
    @emitChange(data.id)

  storeRouteInformation: (data) ->
    @routes[data.id] = data.data
    @emitChange(data.id)

  dehydrate: ->
    stops: @stops
    routes: @routes

  rehydrate: (data) ->
    @stops = data.stops
    @routes = data.routes

  @handlers:
    "StopInformationFound": 'storeStopInformation'
    "StopRoutesFound": 'storeRouteInformation'

module.exports = StopInformationStore
