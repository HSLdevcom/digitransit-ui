isBrowser = window?
React  = require 'react'
L      = if isBrowser then require 'leaflet' else null
Marker = if isBrowser then require('react-leaflet/lib/Marker').default else null
OriginPopup   = require './origin-popup'
Icon   = require '../icon/icon'
{intlShape} = require 'react-intl'

class PlaceMarker extends React.Component
  @contextTypes:
    intl: intlShape.isRequired

  render: ->
    if @props.displayOriginPopup
      popup =
        <OriginPopup
          shouldOpen={true}
          header={@context.intl.formatMessage {id: 'origin', defaultMessage: 'From'}}
          popupContainer={@props.popupContainer}
          text={@props.position.address}
          yOffset={-15}
        />

    <div>
      <Marker
        map={@props.map}
        layerContainer={@props.layerContainer}
        zIndexOffset=10
        position={@props.position}
        icon={L.divIcon(
          html: Icon.asString 'icon-icon_mapMarker-point'
          className: 'place halo'
          iconAnchor: [12, 24])}/>
      <Marker
        map={@props.map}
        layerContainer={@props.layerContainer}
        zIndexOffset=10
        position={@props.position}
        icon={L.divIcon(
          html: Icon.asString 'icon-icon_place'
          className: 'place'
          iconAnchor: [12, 24])}>
        {popup}
      </Marker>
    </div>

module.exports = PlaceMarker
