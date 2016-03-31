Store   = require 'fluxible/addons/BaseStore'
storage = require './local-storage'
config  = require '../config'

class ModeStore extends Store
  @storeName: 'ModeStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    localData = storage.getModeStorage()
    @data = if typeof localData.busState != undefined then localData else
      busState: config.transportModes.bus.defaultValue
      tramState: config.transportModes.tram.defaultValue
      railState: config.transportModes.rail.defaultValue
      subwayState: config.transportModes.subway.defaultValue
      ferryState: config.transportModes.ferry.defaultValue
      airplaneState: config.transportModes.airplane.defaultValue
      citybikeState: config.transportModes.citybike.defaultValue

  getData: ->
    @data

  getMode: ->
    mode = []
    if @getBusState() then mode.push "BUS"
    if @getTramState() then mode.push "TRAM"
    if @getRailState() then mode.push "RAIL"
    if @getSubwayState() then mode.push "SUBWAY"
    if @getFerryState() then mode.push "FERRY"
    if @getAirplaneState() then mode.push "AIRPLANE"
    if @getCitybikeState() then mode.push "BICYCLE_RENT"
    return mode

  getModeString: =>
    return @getMode.join(",")

  getBusState: ->
    @data.busState
  getTramState: ->
    @data.tramState
  getRailState: ->
    @data.railState
  getSubwayState: ->
    @data.subwayState
  getFerryState: ->
    @data.ferryState
  getAirplaneState: ->
    @data.airplaneState
  getCitybikeState: ->
    @data.citybikeState

  toggleBusState: ->
    @data.busState = !@data.busState
    @storeMode()
    @emitChange()
  toggleTramState: ->
    @data.tramState = !@data.tramState
    @storeMode()
    @emitChange()
  toggleRailState: ->
    @data.railState = !@data.railState
    @storeMode()
    @emitChange()
  toggleSubwayState: ->
    @data.subwayState = !@data.subwayState
    @storeMode()
    @emitChange()
  toggleFerryState: ->
    @data.ferryState = !@data.ferryState
    @storeMode()
    @emitChange()
  toggleAirplaneState: ->
    @data.airplaneState = !@data.airplaneState
    @storeMode()
    @emitChange()
  toggleCitybikeState: ->
    @data.citybikeState = !@data.citybikeState
    @storeMode()
    @emitChange()

  storeMode: ->
    storage.setModeStorage(@data)

  dehydrate: ->
    @data

  rehydrate: (data) ->
    @data = data

  @handlers:
    "ToggleNearbyRouteBusState": 'toggleBusState'
    "ToggleNearbyRouteTramState": 'toggleTramState'
    "ToggleNearbyRouteRailState": 'toggleRailState'
    "ToggleNearbyRouteSubwayState": 'toggleSubwayState'
    "ToggleNearbyRouteFerryState": 'toggleFerryState'
    "ToggleNearbyRouteCitybikeState": 'toggleCitybikeState'
    'ToggleNearbyRouteAirplaneState': 'toggleAirplaneState'

module.exports = ModeStore
