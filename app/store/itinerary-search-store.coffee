Store = require 'fluxible/addons/BaseStore'
config  = require '../config'

STORAGE_KEY = "currentItinerary"

class ItinerarySearchStore extends Store
  @storeName: 'ItinerarySearchStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    localData = window?.sessionStorage?.getItem STORAGE_KEY
    @data = if localData then JSON.parse(localData) else {}
    @fromPlace = ""
    @toPlace   = ""
    @ticketOptions = [
      {
        "displayName": "Ei lippuvyöhykerajoitusta",
        "value": "0"
      }
    ]
    @accessibilityOptions = [
      {
        "displayName": "Ei rajoitusta",
        "value": "0"
      },
      {
        "displayName": "Liikun pyörätuolilla",
        "value": "1"
      }
    ]
    @selectedTicketOption = "0"
    @selectedAccessibilityOption = "0"
    @busState = config.transportModes.bus.defaultValue
    @tramState = config.transportModes.tram.defaultValue
    @railState = config.transportModes.rail.defaultValue
    @subwayState = config.transportModes.subway.defaultValue
    @ferryState = config.transportModes.ferry.defaultValue
    @airplaneState = config.transportModes.airplane.defaultValue
    @citybikeState = config.transportModes.citybike.defaultValue
    # These three are mutually exclusive
    @walkState = true
    @bicycleState = false
    @carState = false

    @walkReluctance = 2
    @walkBoardCost = 600          # Vaihdot / transfers
    @minTransferTime = 180        # Vaihtomarginaali / transfer margin
    @walkSpeed = 1.2

  getData: ->
    @data

  getOptions: ->
    params: {
      "to": @toPlace,
      "from": @fromPlace
    }

  getMode: ->
    mode = []
    if @getBusState() then mode.push "BUS"
    if @getTramState() then mode.push "TRAM"
    if @getRailState() then mode.push "RAIL"
    if @getSubwayState() then mode.push "SUBWAY"
    if @getFerryState() then mode.push "FERRY"
    if @getAirplaneState() then mode.push "AIRPLANE"
    if @getCitybikeState() then mode.push "BICYCLE_RENT"
    if @getWalkState() then mode.push "WALK"
    if @getBicycleState() then mode.push "BICYCLE"
    if @getCarState() then mode.push "CAR"
    return mode.join(",")


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
  getRailState: ->
    @railState
  getSubwayState: ->
    @subwayState
  getFerryState: ->
    @ferryState
  getAirplaneState: ->
    @airplaneState
  getCitybikeState: ->
    @citybikeState
  getWalkState: ->
    @walkState
  getBicycleState: ->
    @bicycleState
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
  isWheelchair: ->
    @selectedAccessibilityOption == "1"


  toggleBusState: ->
    @busState = !@busState
    @emitChange()
  toggleTramState: ->
    @tramState = !@tramState
    @emitChange()
  toggleRailState: ->
    @railState = !@railState
    @emitChange()
  toggleSubwayState: ->
    @subwayState = !@subwayState
    @emitChange()
  toggleFerryState: ->
    @ferryState = !@ferryState
    @emitChange()
  toggleAirplaneState: ->
    @airplaneState = !@airplaneState
    @emitChange()
  toggleCitybikeState: ->
    @citybikeState = !@citybikeState
    @emitChange()
  toggleWalkState: ->
    @clearRadioButtons()
    @walkState = !@walkState
    @emitChange()
  toggleBicycleState: ->
    @clearRadioButtons()
    @bicycleState = !@bicycleState
    @emitChange()
  toggleCarState: ->
    @clearRadioButtons()
    @carState = !@carState
    @emitChange()

  clearRadioButtons: ->
    @walkState = @bicycleState = @carState = false
    return

  updateFromToPlaces: (params)  ->
    @toPlace = params.to
    @fromPlace = params.from
    @emitChange()

  setWalkReluctance: (value) ->
    @walkReluctance = parseFloat(value)
    @emitChange()

  setWalkBoardCost: (value) ->
    @walkBoardCost = parseFloat(value)
    @emitChange()

  setMinTransferTime: (value) ->
    @minTransferTime = parseFloat(value)
    @emitChange()

  setWalkSpeed: (value) ->
    @walkSpeed = parseFloat(value)
    @emitChange()

  setTicketOption: (value) ->
    @selectedTicketOption = value
    @emitChange()

  setAccessibilityOption: (value) ->
    @selectedAccessibilityOption = value
    @emitChange()

  storeItinerarySearch: (data) ->
    @data = data
    try
      window?.sessionStorage?.setItem STORAGE_KEY, JSON.stringify @data
    catch error
      if error.name == 'QuotaExceededError'
        console.error('[sessionStorage] Unable to save state; sessionStorage is not available in Safari private mode')
      else
        throw error

    @emitChange()

  clearItinerary: ->
    @data = {}
    window?.sessionStorage?.removeItem STORAGE_KEY
    @emitChange()

  dehydrate: ->
    @data

  rehydrate: (data) ->
    @data = data

  @handlers:
    "ItineraryFound": 'storeItinerarySearch'
    "ItinerarySearchStarted": 'clearItinerary'
    "ToggleItineraryBusState": 'toggleBusState'
    "ToggleItineraryTramState": 'toggleTramState'
    "ToggleItineraryRailState": 'toggleRailState'
    "ToggleItinerarySubwayState": 'toggleSubwayState'
    "ToggleItineraryFerryState": 'toggleFerryState'
    "ToggleItineraryCitybikeState": 'toggleCitybikeState'
    "ToggleItineraryWalkState": 'toggleWalkState'
    "ToggleItineraryBicycleState": 'toggleBicycleState'
    "ToggleItineraryCarState": 'toggleCarState'
    "ToggleItineraryAirplaneState": 'toggleAirplaneState'
    "UpdateFromToPlaces": 'updateFromToPlaces'
    "SetWalkReluctance": "setWalkReluctance"
    "SetWalkBoardCost": "setWalkBoardCost"
    "SetMinTransferTime": "setMinTransferTime"
    "SetWalkSpeed": "setWalkSpeed"
    "SetTicketOption": "setTicketOption"
    "SetAccessibilityOption": "setAccessibilityOption"

module.exports = ItinerarySearchStore
