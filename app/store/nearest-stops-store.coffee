Store = require 'fluxible/addons/BaseStore'

class NearestStopsStore extends Store
  @storeName: 'NearestStopsStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @stops = []
    @stopsInRectangle = []
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
    @distances = {}
    for stop in stops
      @stops.push(stop.id)
      @distances[stop.id] = stop.dist
    @emitChange()

  storeStopsInRectangle: (stops) ->
    @stopsInRectangle = stops
    @emitChange('rectangle')

  getStopsInRectangle: ->
    @stopsInRectangle

  @handlers:
    "NearestStopsFound":   'storeNearestStops'
    "NearestStopsRemoved": 'removeNearestStops'
    "StopsInRectangleFound": 'storeStopsInRectangle'

module.exports = NearestStopsStore
