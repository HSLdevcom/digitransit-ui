xhrPromise = require '../util/xhr-promise'
config     = require '../config'

module.exports = itinerarySearchRequest: (actionContext, options) ->
  actionContext.dispatch "ItinerarySearchStarted"
  params =
    fromPlace: options.params.from
    toPlace: options.params.to
    preferredAgencies: "HSL"
    showIntermediateStops: true
  xhrPromise.getJson(config.URL.OTP + "plan", params).then (data) ->
    actionContext.dispatch "ItineraryFound", data