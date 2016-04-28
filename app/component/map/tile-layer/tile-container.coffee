flatten = require 'lodash/flatten'
config  = require '../../../config'

markersMinZoom = Math.min(config.cityBike.cityBikeMinZoom, config.stopsMinZoom)

class Tile
  constructor: (@coords, done, @props) ->
    @extent = 4096
    @scaleratio = window?.devicePixelRatio or 1
    @tileSize = (@props.tileSize or 256) * @scaleratio
    @ratio = @extent / @tileSize
    @el = @createElement()
    if @coords.z < markersMinZoom or !@el.getContext
      return
    @ctx = @el.getContext '2d'

    @layers = @props.layers.filter (Layer) =>
      if Layer.getName() == "stop" && @coords.z >= config.stopsMinZoom
        true
      else if Layer.getName() == "citybike" && @coords.z >= config.cityBike.cityBikeMinZoom
        true
      else
        false
    .map (Layer) =>
      new Layer(this)
    Promise.all(@layers.map (layer) -> layer.promise).then () =>
      done(null, @el)

  createElement: () =>
    el = document.createElement 'canvas'
    el.setAttribute "class", "leaflet-tile"
    el.setAttribute "height", @tileSize
    el.setAttribute "width", @tileSize
    el.onMapClick = @onMapClick
    el

  onMapClick: (e, point) =>
    if @layers
      localPoint = [(point[0] * @scaleratio) % @tileSize, (point[1] * @scaleratio) % @tileSize]

      features = flatten @layers.map (layer) -> layer.features?.map (feature) ->
        layer: layer.constructor.getName()
        feature: feature

      nearest = features.filter (feature) =>
        return false if !feature
        g = feature.feature.loadGeometry()[0][0]
        dist = Math.sqrt((localPoint[0] - (g.x / @ratio)) ** 2 + (localPoint[1] - (g.y / @ratio)) ** 2)
        if dist < (17 * @scaleratio) then true else false

      if nearest.length == 0
        @onSelectableTargetClicked false
      else if nearest.length == 1
        L.DomEvent.stopPropagation e
        coords = nearest[0].feature.toGeoJSON(@coords.x, @coords.y, @coords.z + (@props.zoomOffset or 0)).geometry.coordinates
        @onSelectableTargetClicked nearest, L.latLng [coords[1], coords[0]]
      else
        L.DomEvent.stopPropagation e
        @onSelectableTargetClicked nearest, e.latlng


module.exports = Tile
