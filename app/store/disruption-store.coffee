Store = require 'fluxible/addons/BaseStore'

class DisruptionStore extends Store
  @storeName: 'DisruptionStore'

  getData: ->
    @data

  getRoutes: ->
    @routes

  calculateRoutes: (data) ->
    [].concat.apply [], data.entity.map (entity) ->
      entity.alert.informed_entity.map (line) ->
        line.agency_id + ':' + line.route_id + ':' + line.trip.direction_id.toString()

  storeDisruptions: (data) ->
    @data = data
    @routes = @calculateRoutes data
    @emitChange()

  dehydrate: ->
    @data
    @routes

  rehydrate: (data) ->
    @data = data
    @routes = @calculateRoutes data

  @handlers:
    "UpdateDisruptions": 'storeDisruptions'

module.exports = DisruptionStore
