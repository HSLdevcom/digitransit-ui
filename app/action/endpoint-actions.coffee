setEndpoint = (actionContext, {target, endpoint}) ->
  actionContext.dispatch "setEndpoint",
    target: target
    value:
      lat: endpoint.lat
      lon: endpoint.lon
      address: endpoint.address

setUseCurrent = (actionContext, target) ->
  actionContext.dispatch "useCurrentPosition", target

swapOriginDestination = (actionContext) ->
  actionContext.dispatch "swapOriginDestination"

clearOrigin = (actionContext) ->
  actionContext.dispatch "clearOrigin"

clearDestination = (actionContext) ->
  actionContext.dispatch "clearDestination"

clearGeolocation = (actionContext) ->
  actionContext.dispatch "clearGeolocation"

disableOriginInputMode = (actionContext) ->
  actionContext.dispatch "disableOriginInputMode"

enableOriginInputMode = (actionContext) ->
  actionContext.dispatch "enableOriginInputMode"

disableDestinationInputMode = (actionContext) ->
  actionContext.dispatch "disableDestinationInputMode"

enableDestinationInputMode = (actionContext) ->
  actionContext.dispatch "enableDestinationInputMode"

module.exports =
  'setEndpoint': setEndpoint
  'setUseCurrent': setUseCurrent
  'swapOriginDestination': swapOriginDestination
  'clearOrigin': clearOrigin
  'clearDestination': clearDestination
  'clearGeolocation': clearGeolocation
