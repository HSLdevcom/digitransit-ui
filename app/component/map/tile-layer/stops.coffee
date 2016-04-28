{VectorTile}  = require 'vector-tile'
Protobuf      = require 'pbf'
L             = require 'leaflet'
memoize       = require 'lodash/memoize'
glfun         = require 'mapbox-gl-function'
getSelector   = require '../../../util/get-selector'


getCaseRadius = memoize glfun
  type: 'exponential'
  base: 1.15
  domain: [11.9, 12, 22]
  range: [0, 1.5, 26]

getStopRadius = memoize glfun
  type: 'exponential'
  base: 1.15
  domain: [11.9, 12, 22]
  range: [0, 1, 24]

getHubRadius = memoize glfun
  type: 'exponential'
  base: 1.15
  domain: [14, 14.1, 22]
  range: [0, 1.5, 12]

getColor = memoize (mode) -> getSelector(".#{mode?.toLowerCase()}")?.style.color

class Stops
  constructor: (@tile) ->
    @promise = fetch("#{config.URL.STOP_MAP}#{@tile.coords.z + (@tile.props.zoomOffset or 0)}/#{@tile.coords.x}/#{@tile.coords.y}.pbf").then (res) =>
      if res.status != 200
        return
      res.arrayBuffer().then (buf) =>
        vt = new VectorTile(new Protobuf(buf))
        @features = [0..vt.layers.stops?.length - 1]
          .map((i) -> vt.layers.stops.feature i)
          .filter((feature) -> feature.properties.type)
        for i in @features
          @addFeature i
        return
      , (err) -> console.log err

  addFeature: (feature) =>
    geom = feature.loadGeometry()
    caseRadius = getCaseRadius $zoom: @tile.coords.z
    stopRadius = getStopRadius $zoom: @tile.coords.z
    hubRadius = getHubRadius $zoom: @tile.coords.z
    if caseRadius > 0
      @tile.ctx.beginPath()
      @tile.ctx.fillStyle = '#fff'
      @tile.ctx.arc geom[0][0].x / @tile.ratio, geom[0][0].y / @tile.ratio, caseRadius * @tile.scaleratio, 0, Math.PI * 2
      @tile.ctx.fill()
      @tile.ctx.beginPath()
      @tile.ctx.fillStyle = getColor feature.properties.type
      @tile.ctx.arc geom[0][0].x / @tile.ratio, geom[0][0].y / @tile.ratio, stopRadius * @tile.scaleratio, 0, Math.PI * 2
      @tile.ctx.fill()
      if hubRadius > 0
        @tile.ctx.beginPath()
        @tile.ctx.fillStyle = '#fff'
        @tile.ctx.arc geom[0][0].x / @tile.ratio, geom[0][0].y / @tile.ratio, hubRadius * @tile.scaleratio, 0, Math.PI * 2
        @tile.ctx.fill()

  @getName = () -> "stop"


module.exports = Stops
