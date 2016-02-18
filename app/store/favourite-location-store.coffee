Store    = require 'fluxible/addons/BaseStore'
storage = require './local-storage'

STORAGE_KEY = "favouriteLocations"
FORCE_STORE_CLEAN = false

class FavouriteLocationStore extends Store
  @storeName: 'FavouriteLocationStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    if @locations == FORCE_STORE_CLEAN
      @locations = []
      storage.setItem(STORAGE_KEY, @locations)
    else
      @locations = @getLocations()

  getLocations: () ->
    locations = storage.getItem(STORAGE_KEY) || "[]"
    JSON.parse(locations)

  addFavouriteLocation: (location) ->
    if typeof location isnt 'object'
      throw new Error("location is not a object:" + JSON.stringify location)
    @locations.push location
    storage.setItem(STORAGE_KEY, @locations)


  @handlers:
    "AddFavouriteLocation": "addFavouriteLocation"
    "GetFavouriteLocation": "getFavouriteLocation"


module.exports = FavouriteLocationStore
