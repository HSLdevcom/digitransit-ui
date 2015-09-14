Store = require 'fluxible/addons/BaseStore'

STORAGE_KEY = "currentItinerary"




class ItinerarySearchStore extends Store
  @storeName: 'ItinerarySearchStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @data = if d = window?.localStorage?.getItemSTORAGE_KEY then JSON.parse(d) else {}
    @ticketOptions = [
      {
        "displayName":   "Ei lippuvyöhykerajoitusta",
        "value":  "0"
      }
    ]
    @accessibilityOptions = [
      {
        "displayName":   "Ei rajoitusta",
        "value":  "0"
      },
      {
        "displayName":   "Liikun pyörätuolilla",
        "value":  "1"
      }
    ]
    @selectedTicketOption = "0";
    @selectedAccessibilityOption = "0"
    @busState = true
    @tramState = true
    @trainState = true
    @subwayState = true
    @ferryState = true
    @walkState = true
    @CycleState = false
    @carState = false

    @walkReluctance = 2
    @walkBoardCost = 600          # Vaihdot
    @minTransferTime = 180         # Vaihtomarginaali
    @walkSpeed = 1.2

  getData: ->
    @data

  getTicketOptions: ->
    @ticketOptions
  getAccessibilityOptions: ->
    @accessibilityOptions
  getSelectedTicketOption: ->
    @selectedTicketOption
  getSelectedAccessibilityOption: ->
    @selectedAccessibilityOption


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

  getWalkReluctance: ->
    @walkReluctance
  getWalkBoardCost: ->
    @walkBoardCost
  getMinTransferTime: ->
    @minTransferTime
  getWalkSpeed: ->
    @walkSpeed


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


  setWalkReluctance: (value) ->
    @walkReluctance = value
    @emitChange()

  setWalkBoardCost: (value) ->
    @walkBoardCost = value * 60
    @emitChange()

  setMinTransferTime: (value) ->
    @minTransferTime = value * 60
    @emitChange()

  setWalkSpeed: (value) ->
    @walkSpeed = value
    @emitChange()

  setTicketOption: (value) ->
    @selectedTicketOption = value
    @emitChange()

  setAccessibilityOption: (value) ->
    @selectedAccessibilityOption = value
    @emitChange()

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
    "SetWalkReluctance" : "setWalkReluctance"
    "SetWalkBoardCost" : "setWalkBoardCost"
    "SetMinTransferTime" : "setMinTransferTime"
    "SetWalkSpeed" : "setWalkSpeed"
    "SetTicketOption" : "setTicketOption"
    "SetAccessibilityOption" : "setAccessibilityOption"

module.exports = ItinerarySearchStore
