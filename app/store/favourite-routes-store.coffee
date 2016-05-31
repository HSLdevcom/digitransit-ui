Store    = require 'fluxible/addons/BaseStore'
includes = require 'lodash/includes'
storage = require './localStorage'

class FavouriteRoutesStore extends Store
  @storeName: 'FavouriteRoutesStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @routes = @getRoutes()

  isFavourite: (id) ->
    includes(@routes, id)

  storeRoutes: () ->
    storage.setFavouriteRoutesStorage(@routes)

  getRoutes: () ->
    storage.getFavouriteRoutesStorage()

  addFavouriteRoute: (routeId) =>
    if typeof routeId isnt 'string'
      throw new Error("routeId is not a string:" + JSON.stringify routeId)
    newRoutes = @routes.filter (id) -> id isnt routeId
    if newRoutes.length is @routes.length
      newRoutes.push routeId
    @routes = newRoutes
    @storeRoutes()
    @emitChange(routeId)

  @handlers:
    "AddFavouriteRoute": "addFavouriteRoute"

module.exports = FavouriteRoutesStore
