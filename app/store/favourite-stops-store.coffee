Store    = require 'fluxible/addons/BaseStore'
includes = require 'lodash/collection/includes'

STORAGE_KEY = "favouriteStops"
FORCE_STORE_CLEAN = false

class FavouriteStopsStore extends Store
  @storeName: 'FavouriteStopsStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @stops = @getStops()
    if @stops == null or FORCE_STORE_CLEAN
      @stops = []
      window.localStorage.setItem(STORAGE_KEY, "[]")

  getStops: () ->
    if !window?
      return undefined
    storage = window.localStorage
    stops = storage.getItem(STORAGE_KEY)
    JSON.parse(stops)

  isFavourite: (id) ->
    includes(@stops, id)

  storeStops: () ->
    storage = window.localStorage
    s = JSON.stringify(@stops)
    window.localStorage.setItem(STORAGE_KEY, s)

  toggleFavouriteStop: (stopId) =>
    if typeof stopId isnt 'string'
      throw "stopId is not a string:" + JSON.stringify stopId
    newStops = @stops.filter (id) -> id isnt stopId

    if newStops.length is @stops.length
      newStops.push stopId
    @stops = newStops
    @storeStops()
    @emitChange(stopId)

  @handlers:
    "AddFavouriteStop": "toggleFavouriteStop"

module.exports = FavouriteStopsStore
