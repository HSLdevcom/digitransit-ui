Store = require 'fluxible/addons/BaseStore'

class StopDeparturesStore extends Store
  @storeName: 'StopDeparturesStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @departures = {}
    @initialStopsStatus = false

  getDepartures: (id) =>
    @departures[id]

  startStopDeparturesFetch: (id) ->
    @departures[id] = false

  initialStopsFetched: ->
    @initialStopsStatus = true

  initialStopsFetchStarted: ->
    @initialStopsStatus = false

  getInitialStopsFetchInProgress: =>
    !@initialStopsStatus

  storeStopDepartures: (data) ->
    deps = []
    for departure in data.departures
      for time in departure.times
        deps.push
          time: time
          pattern: departure.pattern
    deps.sort (a,b) ->
      if a.time.serviceDay + a.time.realtimeDeparture > b.time.serviceDay + b.time.realtimeDeparture then 1 else -1
    @departures[data.id] = deps
    @emitChange(data.id)

  @handlers:
    "StopDeparturesFound": 'storeStopDepartures'
    "StopDeparturesFetchStarted": 'startStopDeparturesFetch'
    "StopsDeparturesFound": 'initialStopsFetched'

module.exports = StopDeparturesStore