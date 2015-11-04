last = require 'lodash/array/last'
polyUtil = require 'polyline-encoded'
xhrPromise = require '../util/xhr-promise'
config     = require '../config'

create_wait_leg = (start_time, duration, point, placename) ->
  leg =
    # OTP returns start and end times in milliseconds, but durations in seconds
    duration: duration / 1000
    endTime: start_time + duration
    from:
      lat: point[0]
      lon: point[1]
      name: placename
    intermediateStops: []
    legGeometry: {points: polyUtil.encode([point])}
    mode: "WAIT"
    routeType: null # non-transit
    route: ""
    startTime: start_time
  leg.to = leg.from
  return leg

add_wait_legs = (data) ->
  for itinerary in data.plan?.itineraries or []
    new_legs = []
    time = itinerary.startTime # tracks when next leg should start

    # Read wait threshold from config and change it to milliseconds
    waitThreshold = config.itinerary.waitThreshold * 1000
    for leg in itinerary.legs
      wait_time = leg.startTime - time
      # If there's enough unaccounted time before a leg, add a wait leg
      if wait_time > waitThreshold
        new_legs.push(
          create_wait_leg(time,
                          wait_time,
                          polyUtil.decode(leg.legGeometry.points)[0],
                          leg.from.name))

      time = leg.endTime  # next wait leg should start when this transit leg ends

      # Then add original leg
      new_legs.push leg

    itinerary.legs = new_legs

itinerarySearchRequest = (actionContext, options, done) ->
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
    maxWalkDistance: config.maxWalkDistance
  xhrPromise.getJson(config.URL.OTP + "plan", params).then((data) ->
    add_wait_legs(data)
    actionContext.dispatch "ItineraryFound", data
    done()
  , (err) ->
    console.error("Failed to perform itinerary search!")
    console.error(err)
    done()
  )


module.exports =
  'itinerarySearchRequest': itinerarySearchRequest

  toggleBusState: (actionContext)  ->
    actionContext.dispatch "ToggleBusState",
      null,
      actionContext.executeAction itinerarySearchRequest

  toggleTramState: (actionContext)  ->
    actionContext.dispatch "ToggleTramState",
      null,
      actionContext.executeAction itinerarySearchRequest

  toggleRailState: (actionContext)  ->
    actionContext.dispatch "ToggleRailState",
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
