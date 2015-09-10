Store = require 'fluxible/addons/BaseStore'

STORAGE_KEY = "currentItinerary"




class ItinerarySearchStore extends Store
  @storeName: 'ItinerarySearchStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @data = if d = window?.localStorage?.getItemSTORAGE_KEY then JSON.parse(d) else {}
    @busState = true
    @tramState = true
    @trainState = true
    @subwayState = true
    @ferryState = true
    @walkState = true
    @CycleState = false
    @carState = false

  getData: ->
    @data

  getBusState: ->
    @busState
  getTramState: ->
    @tramState
  getTrainState: ->
    @trainState
  getSubwayState: ->
    @subwayState
  getFerryState: ->
    @ferryState
  getWalkState: ->
    @walkState
  getCycleState: ->
    @cycleState
  getCarState: ->
    @carState

  toggleBusState: ->
    @busState = !@busState
    @emitChange()

  toggleTramState: ->
    @tramState = !@tramState
    @emitChange()

  toggleTrainState: ->
    @trainState = !@trainState
    @emitChange()

  toggleSubwayState: ->
    @subwayState = !@subwayState
    @emitChange()

  toggleFerryState: ->
    @ferryState = !@ferryState
    @emitChange()

  toggleWalkState: ->
    @clearRadioButtons()
    @walkState = !@walkState
    @emitChange()

  toggleCycleState: ->
    @clearRadioButtons()
    @cycleState = !@cycleState
    @emitChange()

  toggleCarState: ->
    @clearRadioButtons()
    @carState = !@carState
    @emitChange()

  clearRadioButtons: ->
    @walkState = @cycleState = @carState = false
    return

  storeItinerarySearch: (data) ->
    @data = data
    @emitChange()
    window.localStorage.setItem STORAGE_KEY, JSON.stringify @data

  clearItinerary: ->
    @data = {}
    @emitChange()

  dehydrate: ->
    @data

  rehydrate: (data) ->
    @data = data

  @handlers:
    "ItineraryFound": 'storeItinerarySearch'
    "ItinerarySearchStarted": 'clearItinerary'
    "ToggleBusState" : 'toggleBusState'
    "ToggleTramState" : 'toggleTramState'
    "ToggleTrainState" : 'toggleTrainState'
    "ToggleSubwayState" : 'toggleSubwayState'
    "ToggleFerryState" : 'toggleFerryState'
    "ToggleWalkState" : 'toggleWalkState'
    "ToggleCycleState" : 'toggleCycleState'
    "ToggleCarState" : 'toggleCarState'


module.exports = ItinerarySearchStore
