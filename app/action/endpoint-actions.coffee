setOrigin = (actionContext, location, done) ->
  actionContext.dispatch "setOrigin",
    lat: location.lat
    lon: location.lon
    address: location.address
  done()

setDestination = (actionContext, location, done) ->
  actionContext.dispatch "setDestination",
    lat: location.lat
    lon: location.lon
    address: location.address
  done()

setOriginToCurrent = (actionContext) ->
  actionContext.dispatch "setOriginToCurrent"

setDestinationToCurrent = (actionContext) ->
  actionContext.dispatch "setDestinationToCurrent"

swapOriginDestination = (actionContext) ->
  actionContext.dispatch "swapOriginDestination"

clearOrigin = (actionContext) ->
  actionContext.dispatch "clearOrigin"

clearDestination = (actionContext) ->
  actionContext.dispatch "clearDestination"

clearGeolocation = (actionContext) ->
  actionContext.dispatch "clearGeolocation"

module.exports =
  'setOrigin': setOrigin
  'setDestination': setDestination
  'setOriginToCurrent': setOriginToCurrent
  'setDestinationToCurrent': setDestinationToCurrent
  'swapOriginDestination': swapOriginDestination
  'clearOrigin': clearOrigin
  'clearDestination': clearDestination
  'clearGeolocation': clearGeolocation
