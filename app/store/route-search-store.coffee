Store = require 'fluxible/addons/BaseStore'

class RouteSearchStore extends Store
  @storeName: 'RouteSearchStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @data = {}

  getData: ->
    @data

  storeRouteSearch: (data) ->
    @data = data
    @emitChange()

  dehydrate: ->
    @data

  rehydrate: (data) ->
    @data = data

  @handlers:
    "RouteFound": 'storeRouteSearch'

module.exports = RouteSearchStore