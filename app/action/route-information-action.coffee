xhrPromise      = require '../util/xhr-promise'
executeMultiple = require 'fluxible-action-utils/async/executeMultiple'
config          = require '../config'

routeInformationRequest = (actionContext, id, done) ->
  if !actionContext.getStore('RouteInformationStore').getRoute(id)
    xhrPromise.getJson(config.URL.OTP + "index/routes/" + id).then (data) ->
      actionContext.dispatch "RouteInformationFound", data
      done()
  else
    done()

routePatternsRequest = (actionContext, id, done) ->
  if !actionContext.getStore('RouteInformationStore').getRoutePatterns(id)
    xhrPromise.getJson(config.URL.OTP + "index/routes/" + id + "/patterns").then (data) ->
      actionContext.dispatch "RoutePatternsFound", {id: id, data: data}
      done()
  else
    done()

routeTripsRequest = (actionContext, id, done) ->
  if !actionContext.getStore('RouteInformationStore').getRouteTrips(id)
    xhrPromise.getJson(config.URL.OTP + "index/routes/" + id + "/trips").then (data) ->
      actionContext.dispatch "RouteTripsFound", {id: id, data: data}
      done()
  else
    done()

patternInformationRequest = (actionContext, id, done) ->
  if !actionContext.getStore('RouteInformationStore').getPattern(id)
    xhrPromise.getJson(config.URL.OTP + "index/patterns/" + id).then (data) ->
      actionContext.dispatch "PatternInformationFound", data
      done()
  else
    done()

patternGeometryRequest = (actionContext, id, done) ->
  if !actionContext.getStore('RouteInformationStore').getPatternGeometry(id)
    xhrPromise.getJson(config.URL.OTP + "index/patterns/" + id + "/geometry").then (data) ->
      actionContext.dispatch "PatternGeometryFound", {id: id, data: data}
      done()
  else
    done()

fuzzyTripInformationRequest = (actionContext, details, done) ->
  if !actionContext.getStore('RouteInformationStore').getFuzzyTrip(details)
    xhrPromise.getJson(
      config.URL.OTP +
      "index/routes/#{details.route}/trips/#{details.date}/#{details.direction}/#{details.trip}")
      .then(
        (data) ->
          actionContext.dispatch "FuzzyTripInformationFound", {details: details, data: data}
          done())
  else
    done()

routePageDataRequest =  (actionContext, options, done) ->
  patternId = options.params.routeId
  routeId = patternId.split(':', 2).join(':')
  executeMultiple actionContext,
    routeInfo:
      action: routeInformationRequest
      params: routeId
    routePatterns:
      action: routePatternsRequest
      params: routeId
    patternInfo:
      action: patternInformationRequest
      params: patternId
    patternGeometry:
      action: patternGeometryRequest
      params: patternId
    , -> done()

module.exports =
  'routeInformationRequest': routeInformationRequest
  'routePatternsRequest': routePatternsRequest
  'routeTripsRequest': routeTripsRequest
  'patternInformationRequest': patternInformationRequest
  'patternGeometryRequest': patternGeometryRequest
  'fuzzyTripInformationRequest': fuzzyTripInformationRequest
  'routePageDataRequest': routePageDataRequest
