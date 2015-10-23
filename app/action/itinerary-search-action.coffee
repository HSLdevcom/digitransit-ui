last = require 'lodash/array/last'
xhrPromise = require '../util/xhr-promise'
config     = require '../config'

create_wait_leg = (start_time, duration, point, placename) ->
  leg =
    mode: "WAITING"
    routeType: null # non-transit
    route: ""
    duration: duration
    startTime: start_time
    endTime: start_time + duration
    legGeometry: {points: [point]}
    from:
      lat: point[0] * 1e-5
      lon: point[1] * 1e-5
      name: placename
    intermediateStops: []
  leg.to = leg.from
  return leg

add_waiting_legs = (data) ->
  for itinerary in data.plan?.itineraries or []
    new_legs = []
    time = itinerary.startTime # tracks when next leg should start
    for leg in itinerary.legs
      wait_time = leg.startTime - time
      time = leg.endTime # next leg should start when this one ended

      # If there's unaccounted time before a leg, add a waiting leg
      if wait_time > 1000  # OTP often marks time between walk and vehicle as 1000ms
        # OTP starts walking legs as late as possible,
        # so change it to start as early as possible and add the wait after
        if leg.routeType == null
          leg.startTime -= wait_time
          leg.endTime -= wait_time
          new_legs.push leg
          new_legs.push(
            create_wait_leg(leg.endTime,
                            wait_time,
                            last(leg.legGeometry.points),
                            leg.to.name))
        # Other legs can't be started whenever we want (the bus comes when it comes),
        # so add the waiting leg before the transit leg
        else
          new_legs.push(
            create_wait_leg(leg.startTime - wait_time,
                            wait_time,
                            leg.legGeometry.points[0],
                            leg.from.name))
          new_legs.push leg
      else
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
    add_waiting_legs(data)
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
