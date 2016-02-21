config     = require '../config'

module.exports =
  toggleBusState: (actionContext)  ->
    actionContext.dispatch "ToggleNearbyRouteBusState",
      null,
      null

  toggleTramState: (actionContext)  ->
    actionContext.dispatch "ToggleNearbyRouteTramState",
      null,
      null

  toggleRailState: (actionContext)  ->
    actionContext.dispatch "ToggleNearbyRouteRailState",
      null,
      null

  toggleSubwayState: (actionContext)  ->
    actionContext.dispatch "ToggleNearbyRouteSubwayState",
      null,
      null

  toggleFerryState: (actionContext)  ->
    actionContext.dispatch "ToggleNearbyRouteFerryState",
      null,
      null

  toggleAirplaneState: (actionContext)  ->
    actionContext.dispatch "ToggleAirplaneState",
      null,
      null

  toggleCitybikeState: (actionContext)  ->
    actionContext.dispatch "ToggleNearbyRouteCitybikeState",
      null,
      null
