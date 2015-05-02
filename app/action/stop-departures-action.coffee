$               = require 'jquery'
executeMultiple = require 'fluxible-action-utils/async/executeMultiple'

stopInformationRequest = (actionContext, id, done) ->
  if !actionContext.getStore('StopInformationStore').getStop(id)
    $.getJSON "http://matka.hsl.fi/otp/routers/finland" + "/index/stops/" + id , (data) ->
      actionContext.dispatch "StopInformationFound", data
      done()

stopDeparturesRequest = (actionContext, id, done) ->
  actionContext.dispatch "StopDeparturesFetchStarted", id
  $.getJSON "http://matka.hsl.fi/otp/routers/finland" + "/index/stops/" + id + "/stoptimes?detail=true", (data) ->
    actionContext.dispatch "StopDeparturesFound",
      id: id
      departures: data
    done()

fetchInitialStops = (actionContext, payload, done) ->
  NearestStopsStore = actionContext.getStore('NearestStopsStore')
  actions = {}
  for stop in NearestStopsStore.getStops().slice(0,10)
    actions["information" + stop] =
      action: stopInformationRequest
      params: stop
    actions["departures" + stop] =
      action: stopDeparturesRequest
      params: stop
  executeMultiple actionContext, actions, () -> done()

module.exports = 
  'stopDeparturesRequest': stopDeparturesRequest
  'stopInformationRequest': stopInformationRequest
  'fetchInitialStops': fetchInitialStops