React         = require 'react'
Relay         = require 'react-relay'
StopRoute     = require('../../../route/StopRoute').default
isBrowser     = window?
StopMarkerPopup = require '../popups/stop-marker-popup'
provideContext = require 'fluxible-addons-react/provideContext'
intl          = require 'react-intl'
Marker        = if isBrowser then require('react-leaflet/lib/Marker').default
Icon          = require '../../icon/icon'
ReactDomServer = require 'react-dom/server'
config        = require '../../../config'

class LegMarker extends React.Component
  componentDidMount: ->
    @props.map.on 'zoomend', @onMapZoom

  componentWillUnmount: =>
    @props.map.off 'zoomend', @onMapZoom

  onMapZoom: =>
    @forceUpdate()

  getLegMarker: ->
    <Marker map={@props.map}
            layerContainer={@props.layerContainer}
            key={@props.leg.name + "_text"}
            position={lat: @props.leg.lat, lng: @props.leg.lon}
            interactive={false}
            icon={L.divIcon
              html: "<div>#{@props.leg.name}</div>"
              className: 'legmarker ' + @props.mode
              iconSize: [1, 1]
              }/>
      
  render: ->
    unless isBrowser
      return ""
      
    p1 = @props.map.latLngToLayerPoint(@props.leg.from)
    p2 = @props.map.latLngToLayerPoint(@props.leg.to)

    distance = p1.distanceTo(p2)
    minDistanceToShow = 64 # 64 pixels should be enough for everyone ;)

    <div>
      {if distance >= minDistanceToShow then @getLegMarker()}
    </div>

module.exports = LegMarker
