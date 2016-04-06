polyUtil      = require 'polyline-encoded'
getSelector   = require './get-selector'
config        = require '../config'
L             = if window? then require 'leaflet' else null

toRad = (deg) -> deg * Math.PI / 180
toDeg = (rad) -> rad * 180 / Math.PI

# Get direction of movement from two first to second point.
# North is 0, east is 90, south 180, west 270
getBearing = (lat1, lng1, lat2, lng2) ->
  lonScale = Math.cos toRad (lat1 + lat2) / 2
  dy = lat2 - lat1
  dx = (lng2 - lng1) * lonScale
  (toDeg(Math.atan2(dx, dy)) + 360) % 360

getTopicsForPlan = (plan) ->
  for leg in plan.legs when leg.transitLeg and leg.agencyId == "HSL"
    route: leg.routeId.split(":")[1]
    # direction is not yet returned in plan endpoint

getDistanceToNearestStop = (lat, lon, stops) ->
  myPos = new L.LatLng(lat, lon)

  minDist = Number.MAX_VALUE
  minStop = null
  stops.forEach((stop) ->
    stopPos = new L.LatLng(stop.lat, stop.lon)
    if myPos != null
      distance = myPos.distanceTo(stopPos)
      if distance < minDist
        minDist = distance
        minStop = stop
  )

  {
    stop: minStop,
    distance: minDist
  }

displayDistance = (meters) ->
  if meters < 100
    Math.round(meters / 10) * 10 + " m" #round to nearest 10m
  else if 100 < meters < 1000
    Math.round(meters / 50) * 50 + " m" #round to nearest 50m
  else if 1000 < meters < 10000
    (Math.round(meters / 100) * 100) / 1000 + " km" #round to nearest 100m
  else if 10000 < meters < 100000
    Math.round(meters / 1000) + " km" #round to nearest km
  else if 100000 < meters
    Math.round(meters / 10000) * 10 + " km" #round to nearest 10km


getDistanceToFurthestStop = (coordinates, stops) ->
  stops.map (stop) ->
    stop: stop
    distance: coordinates.distanceTo new L.LatLng(stop.lat, stop.lon)
  .reduce (previous, current) ->
    if current.distance > previous.distance then current else previous
  , stop: null, distance: 0


module.exports =
  getBearing: getBearing
  getTopicsForPlan: getTopicsForPlan
  getDistanceToNearestStop: getDistanceToNearestStop
  getDistanceToFurthestStop: getDistanceToFurthestStop
  displayDistance: displayDistance
