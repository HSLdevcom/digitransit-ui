xhrPromise = require '../util/xhr-promise'
config     = require '../config'


itinerarySearchRequest = (actionContext, options) ->
  itinerarySearchStore = actionContext.getStore('ItinerarySearchStore')
  if options?.params
    actionContext.dispatch "UpdateFromToPlaces",
      to: options.params.to
      from: options.params.from
  else
    options = itinerarySearchStore.getOptions()
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
    mode: itinerarySearchStore.getMode()
    walkReluctance: itinerarySearchStore.getWalkReluctance()
    walkBoardCost: itinerarySearchStore.getWalkBoardCost()
    minTransferTime: itinerarySearchStore.getMinTransferTime()
    walkSpeed: itinerarySearchStore.getWalkSpeed()
    wheelchair: itinerarySearchStore.isWheelchair()
  xhrPromise.getJson(config.URL.OTP + "plan", params).then (data) ->
    actionContext.dispatch "ItineraryFound", data


module.exports =
  'itinerarySearchRequest' : itinerarySearchRequest

  toggleBusState: (actionContext)  ->
    actionContext.dispatch "ToggleBusState",
      null,
      actionContext.executeAction itinerarySearchRequest

  toggleTramState: (actionContext)  ->
    actionContext.dispatch "ToggleTramState",
      null,
      actionContext.executeAction itinerarySearchRequest

  toggleTrainState: (actionContext)  ->
    actionContext.dispatch "ToggleTrainState",
      null,
      actionContext.executeAction itinerarySearchRequest

  toggleSubwayState: (actionContext)  ->
    actionContext.dispatch "ToggleSubwayState",
      null,
      actionContext.executeAction itinerarySearchRequest

  toggleFerryState: (actionContext)  ->
    actionContext.dispatch "ToggleFerryState",
      null,
      actionContext.executeAction itinerarySearchRequest

  toggleWalkState: (actionContext)  ->
    actionContext.dispatch "ToggleWalkState",
      null,
      actionContext.executeAction itinerarySearchRequest

  toggleCycleState: (actionContext)  ->
    actionContext.dispatch "ToggleCycleState",
      null,
      actionContext.executeAction itinerarySearchRequest

  toggleCarState: (actionContext)  ->
    actionContext.dispatch "ToggleCarState",
      null,
      actionContext.executeAction itinerarySearchRequest


  setWalkReluctance: (actionContext, value) ->
    actionContext.dispatch "SetWalkReluctance",
      value,
      actionContext.executeAction itinerarySearchRequest

  setWalkBoardCost: (actionContext, value) ->
    actionContext.dispatch "SetWalkBoardCost",
      value,
      actionContext.executeAction itinerarySearchRequest

  setMinTransferTime: (actionContext, value) ->
    actionContext.dispatch "SetMinTransferTime",
      value,
      actionContext.executeAction itinerarySearchRequest

  setWalkSpeed: (actionContext, value) ->
    actionContext.dispatch "SetWalkSpeed",
      value,
      actionContext.executeAction itinerarySearchRequest

  setTicketOption: (actionContext, value) ->
    actionContext.dispatch "SetTicketOption",
      value,
      actionContext.executeAction itinerarySearchRequest

  setAccessibilityOption: (actionContext, value) ->
    actionContext.dispatch "SetAccessibilityOption",
      value,
      actionContext.executeAction itinerarySearchRequest
