Store = require 'fluxible/addons/BaseStore'

class NearestStopsStore extends Store
  @storeName: 'NearestStopsStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @stops = []

  getStops: ->
    @stops
    
  removeNearestStops: ->
    @stops = []

  storeNearestStops: (stops) ->
    stops.sort (a,b) ->
      if a.dist > b.dist then 1 else -1
    @stops = stops
    @emitChange()

  @handlers:
    "NearestStopsFound":   'storeNearestStops'
    "NearestStopsRemoved": 'removeNearestStops'
      
module.exports = NearestStopsStore