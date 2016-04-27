config = require('../../../config')
React         = require 'react'
Relay         = require 'react-relay'
queries       = require '../../../queries'
StopMarkerLayer = require './stop-marker-layer'

class StopMarkerContainer extends React.Component
  render: ->
    if @props.map.getZoom() < config.stopsMinZoom
      minLat = 0.1
      minLon = 0.1
      maxLat = 0.1
      maxLon = 0.1
    else
      bounds = @props.map.getBounds()
      minLat = bounds.getSouth()
      minLon = bounds.getWest()
      maxLat = bounds.getNorth()
      maxLon = bounds.getEast()

    <Relay.RootContainer
      Component={StopMarkerLayer}
      route={new queries.StopMarkerLayerRoute(
        minLat: minLat
        minLon: minLon
        maxLat: maxLat
        maxLon: maxLon
      )}
      renderFetched={(data) =>
        <StopMarkerLayer
          {... data}
          hilightedStops={@props.hilightedStops}
          map={@props.map}
          layerContainer={@props.layerContainer}
          minLat={minLat}
          minLon={minLon}
          maxLat={maxLat}
          maxLon={maxLon}
        />
      }
    />


module.exports = StopMarkerContainer
