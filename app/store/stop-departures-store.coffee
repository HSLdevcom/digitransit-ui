Dispatcher = require '../dispatcher/dispatcher.coffee'
Store      = require './store.coffee'

class StopDeparturesStore extends Store
  constructor: ->
    super()
    @eventEmitter.setMaxListeners(100)
    @departures = {};
    @register()

  storeStopDepartures: (id, departures) ->
    deps = []
    for departure in departures
      for time in departure.times
        deps.push
          time: time
          pattern: departure.pattern
    deps.sort (a,b) ->
      if a.time.serviceDay + a.time.realtimeDeparture > b.time.serviceDay + b.time.realtimeDeparture then 1 else -1
    @departures[id] = deps
    @emitChanges()

  register: -> 
    @dispatchToken = Dispatcher.register (action) =>
      switch action.actionType
        when "StopDeparturesFound" then @storeStopDepartures(action.id, action.stopDepartures)
      
module.exports = new StopDeparturesStore()