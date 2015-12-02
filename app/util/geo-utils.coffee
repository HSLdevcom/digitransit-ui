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

# Helper functions for definig styles and dynamic GeoJSONs for mapbox-gl
dataAsGeoJSON = (data) ->
  type: "FeatureCollection"
  features: for leg in data.legs
    type: "Feature"
    geometry:
      type: "LineString"
      coordinates: ([i[1], i[0]] for i in polyUtil.decode leg.legGeometry.points)
    properties:
      mode: leg.mode.toLowerCase()

locationAsGeoJSON = (coordinates) ->
  type: "FeatureCollection"
  features: [
    type: "Feature"
    geometry:
      type: "Point"
      coordinates: [coordinates.lon, coordinates.lat]
  ]

getLayerForMode = (mode) ->
  id: mode
  type: 'line'
  source: 'route'
  filter: ["==", "mode", mode]
  layout:
    "line-cap": 'round'
  paint:
    "line-width": 3
    "line-color": getSelector(".#{mode}").style?.color or "#999"

getLayerforLocation = ->
  id: 'location'
  type: 'symbol'
  source: 'location'
  layout:
    "icon-allow-overlap": true
    "icon-ignore-placement": true
    "icon-image": "location"

getTopicsForPlan = (plan) ->
  for leg in plan.legs when leg.transitLeg and leg.agencyId == "HSL"
    route: leg.routeId.split(":")[1]
    # direction is not yet returned in plan endpoint

vehiclesAsGeoJson = (vehicles) ->
  type: "FeatureCollection"
  features: for id, vehicle of vehicles
    type: "Feature"
    geometry:
      type: "Point"
      coordinates: [vehicle.long, vehicle.lat]
    properties:
      mode: vehicle.mode
      id: id

getLayerForVehicles = ->
  id: "vehicles"
  type: 'symbol'
  source: 'vehicles'
  layout:
    "icon-allow-overlap": true
    "icon-ignore-placement": true
    "icon-image": "{mode}"

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

getDistanceToFurthestStop = (coordinates, stops) ->
  stops.map (stop) ->
    stop: stop
    distance: coordinates.distanceTo new L.LatLng(stop.lat, stop.lon)
  .reduce (previous, current) ->
    if current.distance > previous.distance then current else previous
  , stop: null, distance: 0


module.exports =
  dataAsGeoJSON: dataAsGeoJSON
  getBearing: getBearing
  getLayerforLocation: getLayerforLocation
  getLayerForMode: getLayerForMode
  locationAsGeoJSON: locationAsGeoJSON
  getTopicsForPlan: getTopicsForPlan
  vehiclesAsGeoJson: vehiclesAsGeoJson
  getLayerForVehicles: getLayerForVehicles
  getDistanceToNearestStop: getDistanceToNearestStop
  getDistanceToFurthestStop: getDistanceToFurthestStop
