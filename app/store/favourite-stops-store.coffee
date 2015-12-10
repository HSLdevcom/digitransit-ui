Store    = require 'fluxible/addons/BaseStore'
includes = require 'lodash/collection/includes'
storage = require './local-storage'

STORAGE_KEY = "favouriteStops"
FORCE_STORE_CLEAN = false

class FavouriteStopsStore extends Store
  @storeName: 'FavouriteStopsStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    if @stops == FORCE_STORE_CLEAN
      @stops = []
      @storeStops()
    else
      @stops = @getStops()

  getStops: () ->
    stops = storage.getItem(STORAGE_KEY) || "[]"
    JSON.parse(stops)

  isFavourite: (id) ->
    includes(@stops, id)

  storeStops: () ->
    storage.setItem(STORAGE_KEY, @stops)

  toggleFavouriteStop: (stopId) =>
    if typeof stopId isnt 'string'
      throw new Error("stopId is not a string:" + JSON.stringify stopId)
    newStops = @stops.filter (id) -> id isnt stopId

    if newStops.length is @stops.length
      newStops.push stopId
    @stops = newStops
    @storeStops()
    @emitChange(stopId)

  @handlers:
    "AddFavouriteStop": "toggleFavouriteStop"

module.exports = FavouriteStopsStore
