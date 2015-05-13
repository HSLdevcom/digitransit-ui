xhrPromise = require '../util/xhr-promise'

module.exports = routeSearchRequest: (actionContext, options) ->
  params =
    fromPlace: options.params.from
    toPlace: options.params.to
    preferredAgencies: "HSL"
  xhrPromise.getJson("http://matka.hsl.fi/otp/routers/finland" + "/plan", params).then (data) ->
    actionContext.dispatch "RouteFound", data