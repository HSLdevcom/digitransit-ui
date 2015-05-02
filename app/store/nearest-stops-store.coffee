Store = require 'fluxible/addons/BaseStore'

class NearestStopsStore extends Store
  @storeName: 'NearestStopsStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @stops = []
    @distances = {}

  getStops: ->
    @stops

  getDistance: (id) ->
    @distances[id]
    
  removeNearestStops: ->
    @stops = []
    @distances = {}

  storeNearestStops: (stops) ->
    stops.sort (a,b) ->
      if a.dist > b.dist then 1 else -1
    @stops = []
    for stop in stops
      @stops.push(stop.id)
      @distances[stop.id] = stop.dist
    @emitChange()

  @handlers:
    "NearestStopsFound":   'storeNearestStops'
    "NearestStopsRemoved": 'removeNearestStops'
      
module.exports = NearestStopsStore