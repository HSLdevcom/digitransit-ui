setOrigin = (actionContext, location, done) ->
  actionContext.dispatch "setOrigin",
    lat: location.lat
    lon: location.lon
    address: location.address

setDestination = (actionContext, location, done) ->
  actionContext.dispatch "setDestination",
    lat: location.lat
    lon: location.lon
    address: location.address

setOriginToCurrent = (actionContext, done) ->
  actionContext.dispatch "setOriginToCurrent",

setDestinationToCurrent = (actionContext, done) ->
  actionContext.dispatch "setDestinationToCurrent",

swapOriginDestination = (actionContext, done) ->
  actionContext.dispatch "swapOriginDestination"

clearOrigin = (actionContext, done) ->
  actionContext.dispatch "clearOrigin",

clearDestination = (actionContext, done) ->
  actionContext.dispatch "clearDestination",

clearGeolocation = (actionContext, done) ->
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
