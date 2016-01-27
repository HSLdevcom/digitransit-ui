last = require 'lodash/array/last'
polyUtil = require 'polyline-encoded'
xhrPromise = require '../util/xhr-promise'
config     = require '../config'

createWaitLeg = (startTime, duration, point, placename) ->
  leg =
    # OTP returns start and end times in milliseconds, but durations in seconds
    duration: duration / 1000
    endTime: startTime + duration
    from:
      lat: point[0]
      lon: point[1]
      name: placename
    intermediateStops: []
    legGeometry: {points: polyUtil.encode([point])}
    mode: "WAIT"
    routeType: null # non-transit
    route: ""
    startTime: startTime
  leg.to = leg.from
  return leg

addWaitLegs = (data) ->
  for itinerary in data.plan?.itineraries or []
    newLegs = []
    time = itinerary.startTime # tracks when next leg should start

    # Read wait threshold from config and change it to milliseconds
    waitThreshold = config.itinerary.waitThreshold * 1000

    for leg in itinerary.legs

      if leg.rentedBike == true
        if leg.mode == 'BICYCLE'
          leg.mode = 'CITYBIKE'
        if leg.mode == 'WALK'
          leg.mode = 'CITYBIKE_WALK'

      waitTime = leg.startTime - time
      # If there's enough unaccounted time before a leg, add a wait leg
      if waitTime > waitThreshold
        newLegs.push(
          createWaitLeg(time,
                          waitTime,
                          polyUtil.decode(leg.legGeometry.points)[0],
                          leg.from.name))

      time = leg.endTime  # next wait leg should start when this transit leg ends

      # Then add original leg
      newLegs.push leg

    itinerary.legs = newLegs

itinerarySearchRequest = (actionContext, options, done) ->
  itinerarySearchStore = actionContext.getStore('ItinerarySearchStore')
  if options?.params
    actionContext.dispatch "UpdateFromToPlaces",
      to: options.params.to
      from: options.params.from
  else
    options = itinerarySearchStore.getOptions()
  actionContext.dispatch "ItinerarySearchStarted"
  time = actionContext.getStore("TimeStore").getSelectedTime()
  arriveBy = actionContext.getStore("TimeStore").getArriveBy()
  unless actionContext.getStore("TimeStore").isSelectedTimeSet()
    actionContext.dispatch "SetSelectedTime", time
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
    # TODO: remove ugly hack when fixed in OTP
    disableRemainingWeightHeuristic: itinerarySearchStore.getCitybikeState()

  if itinerarySearchStore.getMode().indexOf('BICYCLE') == -1
    params.maxWalkDistance = config.maxWalkDistance
  else
    params.maxWalkDistance = config.maxBikingDistance

  xhrPromise.getJson(config.URL.OTP + "plan", params).then((data) ->
    addWaitLegs(data)
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

  toggleCitybikeState: (actionContext)  ->
    actionContext.dispatch "ToggleCitybikeState",
      null,
      actionContext.executeAction itinerarySearchRequest

  toggleAirplaneState: (actionContext)  ->
    actionContext.dispatch "ToggleAirplaneState",
      null,
      actionContext.executeAction itinerarySearchRequest

  toggleWalkState: (actionContext)  ->
    actionContext.dispatch "ToggleWalkState",
      null,
      actionContext.executeAction itinerarySearchRequest

  toggleBicycleState: (actionContext)  ->
    actionContext.dispatch "ToggleBicycleState",
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
