React         = require 'react'
Relay         = require 'react-relay'
queries       = require '../../queries'
StopMarkerLayer = require './stop-marker-layer'

STOPS_MAX_ZOOM = 14

class StopMarkerContainer extends React.Component
  render: ->
    if STOPS_MAX_ZOOM >= @props.map.getZoom()
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
      route={new queries.StopMarkerContainerRoute({
        minLat: minLat
        minLon: minLon
        maxLat: maxLat
        maxLon: maxLon
        })}
      renderFetched={(data) =>
        <StopMarkerLayer
          hilightedStops={@props.hilightedStops}
          map={@props.map}
          stopsInRectangle={data.stopsInRectangle}
          minLat={minLat}
          minLon={minLon}
          maxLat={maxLat}
          maxLon={maxLon}
        />
      }
    />

module.exports = StopMarkerContainer
