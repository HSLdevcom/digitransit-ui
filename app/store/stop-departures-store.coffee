Store = require 'fluxible/addons/BaseStore'

class StopDeparturesStore extends Store
  @storeName: 'StopDeparturesStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @departures = {}
    @dates = {}
    @initialStopsStatus = false
    @additionalStopStatus = false

  getDepartures: (id) =>
    @departures[id]

  startStopDeparturesFetch: (id) ->
    @departures[id] = false

  initialStopsFetched: ->
    @initialStopsStatus = true
    @additionalStopStatus = true
    @emitChange()

  initialStopsFetchStarted: ->
    @initialStopsStatus = false

  getInitialStopsFetchInProgress: =>
    !@initialStopsStatus

  startAdditionalStopDeparturesFetch: =>
    @additionalStopStatus = false

  getAdditionalStopsFetchInProgress: =>
    !@additionalStopStatus

  getDateForStop: (id) =>
    @dates[id]

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
    @dates[data.id] = data.date
    @emitChange(data.id)

  storeAdditionalStopDepartures: (data) ->
    deps = @departures[data.id] or []
    for departure in data.departures
      for time in departure.times
        deps.push
          time: time
          pattern: departure.pattern
    deps.sort (a,b) ->
      if a.time.serviceDay + a.time.realtimeDeparture > b.time.serviceDay + b.time.realtimeDeparture then 1 else -1
    @departures[data.id] = deps
    @dates[data.id] = data.date
    @additionalStopStatus = true
    @emitChange(data.id)

  dehydrate: ->
    departures: @departures
    dates: @dates

  rehydrate: (data) ->
    @departures = data.departures
    @dates = data.dates
    @additionalStopStatus = true
    @initialStopsStatus = true

  @handlers:
    "StopDeparturesFound": 'storeStopDepartures'
    "StopDeparturesFetchStarted": 'startStopDeparturesFetch'
    "StopsDeparturesFound": 'initialStopsFetched'
    "AdditionalStopDeparturesFound": 'storeAdditionalStopDepartures'
    "AdditionalStopDeparturesFetchStarted": 'startAdditionalStopDeparturesFetch'

module.exports = StopDeparturesStore