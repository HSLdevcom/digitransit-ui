Store    = require 'fluxible/addons/BaseStore'
includes = require 'lodash/includes'
storage = require './local-storage'

STORAGE_KEY = "favouriteRoutes"
FORCE_STORE_CLEAN = false

class FavouriteRoutesStore extends Store
  @storeName: 'FavouriteRoutesStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    if FORCE_STORE_CLEAN
      @routes = []
      storeRoutes()
    else
      @routes = @getRoutes()

  getRoutes: () ->
    routes = storage.getItem(STORAGE_KEY) || "[]"
    JSON.parse(routes)

  isFavourite: (id) ->
    includes(@routes, id)

  storeRoutes: () ->
    storage.setItem(STORAGE_KEY, @routes)

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
