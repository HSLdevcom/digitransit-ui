xhrPromise = require '../util/xhr-promise'

module.exports = routeSearchRequest: (actionContext, options, done) ->
  xhrPromise.getJson("http://matka.hsl.fi/otp/routers/finland" + "/plan", options).then (data) ->
    actionContext.dispatch "RouteFound", data
    done()