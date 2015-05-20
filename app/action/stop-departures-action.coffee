xhrPromise      = require '../util/xhr-promise'
executeMultiple = require 'fluxible-action-utils/async/executeMultiple'

stopInformationRequest = (actionContext, id, done) ->
  if !actionContext.getStore('StopInformationStore').getStop(id)
    xhrPromise.getJson("http://matka.hsl.fi/otp/routers/finland" + "/index/stops/" + id).then (data) ->
      actionContext.dispatch "StopInformationFound", data
      done()

stopDeparturesRequest = (actionContext, id, done) ->
  actionContext.dispatch "StopDeparturesFetchStarted", id
  xhrPromise.getJson("http://matka.hsl.fi/otp/routers/finland" + "/index/stops/" + id + "/stoptimes?detail=true&numberOfDepartures=5").then (data) ->
    actionContext.dispatch "StopDeparturesFound",
      id: id
      departures: data
    done()

fetchStopsDepartures = (actionContext, options, done) ->
  NearestStopsStore = actionContext.getStore('NearestStopsStore')
  actions = {}
  for stop in NearestStopsStore.getStops().slice(options.from, options.to)
    actions["information" + stop] =
      action: stopInformationRequest
      params: stop
    actions["departures" + stop] =
      action: stopDeparturesRequest
      params: stop
  executeMultiple actionContext, actions, () -> 
    actionContext.dispatch "StopsDeparturesFound"
    done()

module.exports = 
  'stopDeparturesRequest': stopDeparturesRequest
  'stopInformationRequest': stopInformationRequest
  'fetchStopsDepartures': fetchStopsDepartures