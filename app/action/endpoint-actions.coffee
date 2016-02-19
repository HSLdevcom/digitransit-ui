setEndpoint = (actionContext, {target, endpoint}) ->
  actionContext.dispatch "setEndpoint",
    target: target
    value:
      lat: endpoint.lat
      lon: endpoint.lon
      address: endpoint.address

setUseCurrent = (actionContext, target) ->
  actionContext.dispatch "useCurrentPosition", target

swapEndpoints = (actionContext) ->
  actionContext.dispatch "swapEndpoints"

clearOrigin = (actionContext) ->
  actionContext.dispatch "clearOrigin"

clearDestination = (actionContext) ->
  actionContext.dispatch "clearDestination"

clearGeolocation = (actionContext) ->
  actionContext.dispatch "clearGeolocation"

module.exports =
  'setEndpoint': setEndpoint
  'setUseCurrent': setUseCurrent
  'swapEndpoints': swapEndpoints
  'clearOrigin': clearOrigin
  'clearDestination': clearDestination
  'clearGeolocation': clearGeolocation
