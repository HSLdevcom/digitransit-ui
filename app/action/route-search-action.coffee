xhrPromise = require '../util/xhr-promise'
config     = require '../config'

module.exports = routeSearchRequest: (actionContext, options) ->
  params =
    fromPlace: options.params.from
    toPlace: options.params.to
    preferredAgencies: "HSL"
  xhrPromise.getJson(config.URL.OTP + "plan", params).then (data) ->
    actionContext.dispatch "RouteFound", data