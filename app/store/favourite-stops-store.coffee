Store = require 'fluxible/addons/BaseStore'

STORAGE_KEY = "favouriteStops"
FORCE_STORE_CLEAN = false

class FavouriteStopsStore extends Store
  @storeName: 'FavouriteStopsStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    if @getStops() == null or FORCE_STORE_CLEAN
      window.localStorage.setItem(STORAGE_KEY, "[]")

  getStops: () ->
    if !window?
      return undefined
    storage = window.localStorage
    stops = storage.getItem(STORAGE_KEY)
    JSON.parse(stops)

  storeStops: (stops) ->
    storage = window.localStorage
    s = JSON.stringify(stops)
    window.localStorage.setItem(STORAGE_KEY, s)

  addFavouriteStop: (stopId) =>
    console.log(@getStops())
    stops = @getStops()
    stops.push
      "code": stopId,
      "dist": 0,
      "id": stopId,
      "lat": 0,
      "lon": 0,
      "name": "Favourite"
    @storeStops(stops)
    @emitChange()

  @handlers:
    "AddFavouriteStop": "addFavouriteStop"
      
module.exports = FavouriteStopsStore