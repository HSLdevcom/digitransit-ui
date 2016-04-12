{ locationToOTP }    = require '../util/otp-strings'
{ getRoutePath }    = require '../util/path'

storeEndpoint = (actionContext, {target, endpoint}, done) ->

  actionContext.dispatch "setEndpoint",
    {target: target
    value:
      lat: endpoint.lat
      lon: endpoint.lon
      address: endpoint.address}
  done()

#sets endpoint and tries to do routing
module.exports.setEndpoint = (actionContext, payload) =>
  actionContext.executeAction(storeEndpoint, payload, (e) =>
    if e
      console.error "Could not store endpoint: ", e
    else actionContext.executeAction(@route, undefined, (e)=>
      if e
        console.error "Could not route:", e
    )
  )

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

module.exports.route = (actionContext, payload, done) ->

  geolocation = actionContext.getStore('PositionStore').getLocationState()
  origin = actionContext.getStore('EndpointStore').getOrigin()
  destination = actionContext.getStore('EndpointStore').getDestination()

  console.log "trying to route", origin, destination, geolocation
  if (origin.lat or origin.useCurrentPosition and geolocation.hasLocation) and (destination.lat or destination.useCurrentPosition and geolocation.hasLocation)
    # TODO: currently address gets overwritten by reverse from geolocation
    # Swap the position of the two arguments to get "Oma sijainti"
    geo_string = locationToOTP Object.assign({address: "Oma sijainti"}, geolocation)

    if origin.useCurrentPosition
      from = geo_string
    else
      from = locationToOTP(origin)

    if destination.useCurrentPosition
      to = geo_string
    else
      to = locationToOTP(destination)

    # https://github.com/reactjs/react-router/blob/master/docs/guides/NavigatingOutsideOfComponents.md, but we have custom history
    history  = require '../history'
    history.push pathname:getRoutePath(from, to)

  else
    console.log("Could not route")

  done()
