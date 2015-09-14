xhrPromise = require '../util/xhr-promise'
config     = require '../config'

module.exports =
  itinerarySearchRequest: (actionContext, options) ->
    actionContext.dispatch "ItinerarySearchStarted"
    time = actionContext.getStore("TimeStore").getTime()
    arriveBy = actionContext.getStore("TimeStore").getArriveBy()
    if actionContext.getStore("TimeStore").status == "UNSET"
      actionContext.dispatch "SetCurrentTime", time
    params =
      fromPlace: options.params.from
      toPlace: options.params.to
      preferredAgencies: config.preferredAgency or ""
      showIntermediateStops: true
      arriveBy: arriveBy
      date: time.format("YYYY-MM-DD")
      time: time.format("HH:mm:ss")
    xhrPromise.getJson(config.URL.OTP + "plan", params).then (data) ->
      actionContext.dispatch "ItineraryFound", data

  toggleBusState: (actionContext)  ->
    actionContext.dispatch "ToggleBusState"

  toggleTramState: (actionContext)  ->
    actionContext.dispatch "ToggleTramState"

  toggleTrainState: (actionContext)  ->
    actionContext.dispatch "ToggleTrainState"

  toggleSubwayState: (actionContext)  ->
    actionContext.dispatch "ToggleSubwayState"

  toggleFerryState: (actionContext)  ->
    actionContext.dispatch "ToggleFerryState"

  toggleWalkState: (actionContext)  ->
    actionContext.dispatch "ToggleWalkState"

  toggleCycleState: (actionContext)  ->
    actionContext.dispatch "ToggleCycleState"

  toggleCarState: (actionContext)  ->
    actionContext.dispatch "ToggleCarState"


  setWalkReluctance: (actionContext, value) ->
    actionContext.dispatch "SetWalkReluctance", value

  setWalkBoardCost: (actionContext, value) ->
    actionContext.dispatch "SetWalkBoardCost", value

  setMinTransferTime: (actionContext, value) ->
    actionContext.dispatch "SetMinTransferTime", value

  setWalkSpeed: (actionContext, value) ->
    actionContext.dispatch "SetWalkSpeed", value

  setTicketOption: (actionContext, value) ->
    actionContext.dispatch "SetTicketOption", value

  setAccessibilityOption: (actionContext, value) ->
    actionContext.dispatch "SetAccessibilityOption", value
