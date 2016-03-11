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

alterLegsForAirportSupport = (data) ->
  for itinerary in data.plan?.itineraries or []
    for leg, index in itinerary.legs
      if index + 1 < itinerary.legs.length
        nextLeg = itinerary.legs[index + 1]
        if leg.mode == 'WAIT' and nextLeg.mode == 'AIRPLANE'
          leg.nextLeg = itinerary.legs[index + 1]
          leg.type = "CHECK-IN"
      if index - 1 > 0
        previousLegMode = itinerary.legs[index - 1]
        previousLeg = itinerary.legs[index - 1]
        if leg.mode == 'WAIT' and previousLeg.mode == 'AIRPLANE'
          leg.type = "LUGGAGE-COLLECT"

module.exports.itinerarySearchRequest = itinerarySearchRequest = (actionContext, options, done) ->
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
    alterLegsForAirportSupport(data)
    actionContext.dispatch "ItineraryFound", data
    done()
  , (err) ->
    console.error("Failed to perform itinerary search!")
    console.error(err)
    done()
  )


module.exports.toggleBusState = (actionContext)  ->
  actionContext.dispatch "ToggleItineraryBusState",
    null,
    actionContext.executeAction itinerarySearchRequest

module.exports.toggleTramState = (actionContext)  ->
  actionContext.dispatch "ToggleItineraryTramState",
    null,
    actionContext.executeAction itinerarySearchRequest

module.exports.toggleRailState = (actionContext)  ->
  actionContext.dispatch "ToggleItineraryRailState",
    null,
    actionContext.executeAction itinerarySearchRequest

module.exports.toggleSubwayState = (actionContext)  ->
  actionContext.dispatch "ToggleItinerarySubwayState",
    null,
    actionContext.executeAction itinerarySearchRequest

module.exports.toggleFerryState = (actionContext)  ->
  actionContext.dispatch "ToggleItineraryFerryState",
    null,
    actionContext.executeAction itinerarySearchRequest

module.exports.toggleCitybikeState = (actionContext)  ->
  actionContext.dispatch "ToggleItineraryCitybikeState",
    null,
    actionContext.executeAction itinerarySearchRequest

module.exports.toggleAirplaneState = (actionContext)  ->
  actionContext.dispatch "ToggleItineraryAirplaneState",
    null,
    actionContext.executeAction itinerarySearchRequest

module.exports.toggleWalkState = (actionContext)  ->
  actionContext.dispatch "ToggleItineraryWalkState",
    null,
    actionContext.executeAction itinerarySearchRequest

module.exports.toggleBicycleState = (actionContext)  ->
  actionContext.dispatch "ToggleItineraryBicycleState",
    null,
    actionContext.executeAction itinerarySearchRequest

module.exports.toggleCarState = (actionContext)  ->
  actionContext.dispatch "ToggleItineraryCarState",
    null,
    actionContext.executeAction itinerarySearchRequest

module.exports.setWalkReluctance = (actionContext, value) ->
  actionContext.dispatch "SetWalkReluctance",
    value,
    actionContext.executeAction itinerarySearchRequest

module.exports.setWalkBoardCost = (actionContext, value) ->
  actionContext.dispatch "SetWalkBoardCost",
    value,
    actionContext.executeAction itinerarySearchRequest

module.exports.setMinTransferTime = (actionContext, value) ->
  actionContext.dispatch "SetMinTransferTime",
    value,
    actionContext.executeAction itinerarySearchRequest

module.exports.setWalkSpeed = (actionContext, value) ->
  actionContext.dispatch "SetWalkSpeed",
    value,
    actionContext.executeAction itinerarySearchRequest

module.exports.setTicketOption = (actionContext, value) ->
  actionContext.dispatch "SetTicketOption",
    value,
    actionContext.executeAction itinerarySearchRequest

module.exports.setAccessibilityOption = (actionContext, value) ->
  actionContext.dispatch "SetAccessibilityOption",
    value,
    actionContext.executeAction itinerarySearchRequest
