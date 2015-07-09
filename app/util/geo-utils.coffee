polyUtil      = require 'polyline-encoded'
getSelector   = require './get-selector'

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
  res =
    type: "FeatureCollection"
    features: []

  for leg in data.legs
    res.features.push
      type: "Feature"
      geometry:
        type: "LineString"
        coordinates: ([i[1], i[0]] for i in polyUtil.decode leg.legGeometry.points)
      properties:
        mode: leg.mode.toLowerCase()
  res

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


module.exports =
  dataAsGeoJSON: dataAsGeoJSON
  getBearing: getBearing
  getLayerforLocation: getLayerforLocation
  getLayerForMode: getLayerForMode
  locationAsGeoJSON: locationAsGeoJSON