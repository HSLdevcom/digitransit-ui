module.exports.setEndpoint = (actionContext, {target, endpoint}) ->
  actionContext.dispatch "setEndpoint",
    target: target
    value:
      lat: endpoint.lat
      lon: endpoint.lon
      address: endpoint.address

module.exports.setUseCurrent = (actionContext, target) ->
  actionContext.dispatch "useCurrentPosition", target

module.exports.swapEndpoints = (actionContext) ->
  actionContext.dispatch "swapEndpoints"

module.exports.clearOrigin = (actionContext) ->
  actionContext.dispatch "clearOrigin"

module.exports.clearDestination = (actionContext) ->
  actionContext.dispatch "clearDestination"

module.exports.clearGeolocation = (actionContext) ->
  actionContext.dispatch "clearGeolocation"
