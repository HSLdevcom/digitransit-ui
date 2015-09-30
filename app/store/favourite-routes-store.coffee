Store    = require 'fluxible/addons/BaseStore'
includes = require 'lodash/collection/includes'

STORAGE_KEY = "favouriteRoutes"
FORCE_STORE_CLEAN = false

class FavouriteRoutesStore extends Store
  @storeName: 'FavouriteRoutesStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @routes = @getRoutes()
    if @routes == null or FORCE_STORE_CLEAN
      @routes = []
      window.localStorage.setItem(STORAGE_KEY, "[]")

  getRoutes: () ->
    if !window?
      return undefined
    storage = window.localStorage
    routes = storage.getItem(STORAGE_KEY)
    JSON.parse(routes)

  isFavourite: (id) ->
    includes(@routes, id)

  storeRoutes: () ->
    storage = window.localStorage
    s = JSON.stringify(@routes)
    window.localStorage.setItem(STORAGE_KEY, s)

  addFavouriteRoute: (routeId) =>
    newRoutes = @routes.filter (id) -> id isnt routeId
    if newRoutes.length is @routes.length
      newRoutes.push routeId
    @routes = newRoutes
    @storeRoutes()
    @emitChange(routeId)

  @handlers:
    "AddFavouriteRoute": "addFavouriteRoute"

module.exports = FavouriteRoutesStore
