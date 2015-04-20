Dispatcher = require '../dispatcher/dispatcher.coffee'
Store = require './store.coffee'

STORAGE_KEY = "favouriteStops"
FORCE_STORE_CLEAN = false

class FavouriteStopsStore extends Store
  constructor: ->
    super()
    if @getStops() == null or FORCE_STORE_CLEAN
      window.localStorage.setItem(STORAGE_KEY, "[]")
    @register()    

  getStops: () ->
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
    @emitChanges()

  register: -> 
    @dispatchToken = Dispatcher.register (action) =>
      switch action.actionType
        when "AddFavouriteStop" then @addFavouriteStop(action.stopId)
      
module.exports = new FavouriteStopsStore()