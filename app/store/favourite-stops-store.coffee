Store    = require 'fluxible/addons/BaseStore'
includes = require 'lodash/includes'
storage = require './localStorage'

class FavouriteStopsStore extends Store
  @storeName: 'FavouriteStopsStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @stops = @getStops()

  getStops: () ->
    storage.getFavouriteStopsStorage()

  isFavourite: (id) ->
    includes(@stops, id)

  storeStops: () ->
    storage.setFavouriteStopsStorage(@stops)

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
