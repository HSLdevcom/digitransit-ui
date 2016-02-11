isBrowser = window?
React  = require 'react'
L      = if isBrowser then require 'leaflet' else null
Marker = if isBrowser then require('react-leaflet/lib/Marker').default else null
Icon   = require '../icon/icon'

class PlaceMarker extends React.Component
  render: ->
    <div>
      <Marker
        map={@props.map}
        zIndexOffset=10
        position={@props.position}
        icon={L.divIcon(
          html: Icon.asString 'icon-icon_mapMarker-point'
          className: 'place halo'
          iconAnchor: [12, 24])}/>
      <Marker
        map={@props.map}
        zIndexOffset=10
        position={@props.position}
        icon={L.divIcon(
          html: Icon.asString 'icon-icon_place'
          className: 'place'
          iconAnchor: [12, 24])}/>
    </div>

module.exports = PlaceMarker
