React         = require 'react'
isBrowser     = window?
Marker        = if isBrowser then require 'react-leaflet/lib/Marker'
Popup         = if isBrowser then require './dynamic-popup'
L             = if isBrowser then require 'leaflet'
provideContext = require 'fluxible-addons-react/provideContext'


STOPS_SMALL_MAX_ZOOM = 15

class GenericMarker extends React.Component

  getIcon: (mode, selected, zoom) =>
    L.divIcon
      html:
        if zoom <= STOPS_SMALL_MAX_ZOOM then @props.icons.smallIconSvg
        else if selected then @props.icons.selectedIconSvg else @props.icons.iconSvg
      iconSize:
        if zoom <= STOPS_SMALL_MAX_ZOOM then @props.iconSizes.smallIconSvg
        else if selected then @props.iconSizes.selectedIconSvg else @props.iconSizes.iconSvg
      className: mode + ' cursor-pointer'

  componentDidMount: ->
    @props.map.on 'zoomend', @onMapMove

  componentWillUnmount: ->
    @props.map.off 'zoomend', @onMapMove

  onMapMove: =>
    @forceUpdate()

  shouldComponentUpdate: (nextProps) ->
    return nextProps.id != @props.id;

  getMarker: ->
    <Marker map={@props.map}
            position={lat: @props.position.lat, lng: @props.position.lon}
            icon={@getIcon(
              @props.mode + (if @props.thin then " thin" else ""),
              @props.selected,
              @props.map.getZoom())}>
       <Popup options={
         offset: [106, 3]
         closeButton: false
         maxWidth: 250
         minWidth: 250
         className: "popup"}>
         {@props.children}
       </Popup>
    </Marker>

  getNameMarker: ->
    unless @props.renderName
      return false
    <Marker map={@props.map}
            key={@props.name + "_text"}
            position={lat: @props.position.lat, lng: @props.position.lon}
            interactive={false}
            icon={L.divIcon
              html: "<div>#{@props.name}</div>"
              className: 'popup stop-name-marker'
              iconSize: [150, 0]
              iconAnchor: [-8, 7]}
    />

  render: ->
    unless isBrowser
      return ""
    <div>
      {@getMarker()}
      {@getNameMarker()}
    </div>

module.exports = GenericMarker
