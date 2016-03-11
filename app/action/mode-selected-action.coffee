config     = require '../config'

module.exports.toggleBusState = (actionContext)  ->
  actionContext.dispatch "ToggleNearbyRouteBusState"

module.exports.toggleTramState = (actionContext)  ->
  actionContext.dispatch "ToggleNearbyRouteTramState"

module.exports.toggleRailState = (actionContext)  ->
  actionContext.dispatch "ToggleNearbyRouteRailState"

module.exports.toggleSubwayState = (actionContext)  ->
  actionContext.dispatch "ToggleNearbyRouteSubwayState"

module.exports.toggleFerryState = (actionContext)  ->
  actionContext.dispatch "ToggleNearbyRouteFerryState"

module.exports.toggleAirplaneState = (actionContext)  ->
  actionContext.dispatch "ToggleNearbyRouteAirplaneState"

module.exports.toggleCitybikeState = (actionContext)  ->
  actionContext.dispatch "ToggleNearbyRouteCitybikeState"
