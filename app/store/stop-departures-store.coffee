Dispatcher = require '../dispatcher/dispatcher.coffee'
Store      = require './store.coffee'

class StopDeparturesStore extends Store
  constructor: ->
    super()
    @eventEmitter.setMaxListeners(100)
    @departures = {};
    @register()

  storeStopDepartures: (id, departures) ->
    departures.sort (a,b) ->
      if a.times[0].serviceDay + a.times[0].realtimeDeparture > b.times[0].serviceDay + b.times[0].realtimeDeparture then 1 else -1
    @departures[id] = departures
    @emitChanges()

  register: -> 
    @dispatchToken = Dispatcher.register (action) =>
      switch action.actionType
        when "StopDeparturesFound" then @storeStopDepartures(action.id, action.stopDepartures)
      
module.exports = new StopDeparturesStore()