Store    = require 'fluxible/addons/BaseStore'
storage = require './localStorage'

class FavouriteLocationStore extends Store
  @storeName: 'FavouriteLocationStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @locations = @getLocations()

  getLocations: () ->
    storage.getFavouriteLocationsStorage()

  addFavouriteLocation: (location) ->
    if typeof location isnt 'object'
      throw new Error("location is not a object:" + JSON.stringify location)
    @locations.push location
    storage.setFavouriteLocationsStorage(@locations)

  @handlers:
    "AddFavouriteLocation": "addFavouriteLocation"

module.exports = FavouriteLocationStore
