config = require('../../config')
React         = require 'react'
isBrowser     = window?
Marker        = if isBrowser then require('react-leaflet/lib/Marker').default
Popup         = if isBrowser then require './dynamic-popup'
L             = if isBrowser then require 'leaflet'
provideContext = require 'fluxible-addons-react/provideContext'
ComponentUsageExample = require '../documentation/component-usage-example'


class GenericMarker extends React.Component

  @description:
    <div>
      <p>A base class for markers.</p>
      <ComponentUsageExample description="">
        <GenericMarker
          position={lat: 60.1626075196532, lon: 24.939603788199364}
          mode="citybike"
          icons={smallIconSvg: "smallIcon in svg", iconSvg: "icon in svg"}
          iconSizes={smallIconSvg: [8, 8], iconSvg: [20, 20]}
          map={"leaflet map object"}
          id={"marker id here"}
        >
      </ComponentUsageExample>
    </div>

  @displayName: "GenericMarker"

  @propTypes:
    position: React.PropTypes.object.isRequired
    mode: React.PropTypes.string.isRequired
    icons: React.PropTypes.object.isRequired
    iconSizes: React.PropTypes.object.isRequired
    map: React.PropTypes.object.isRequired
    id: React.PropTypes.string
    renderName: React.PropTypes.bool
    selected: React.PropTypes.bool
    name: React.PropTypes.string

  getIcon: (mode, selected, zoom) =>
    L.divIcon
      html:
        if zoom <= config.stopsSmallMaxZoom then @props.icons.smallIconSvg
        else if selected then @props.icons.selectedIconSvg else @props.icons.iconSvg
      iconSize:
        if zoom <= config.stopsSmallMaxZoom then @props.iconSizes.smallIconSvg
        else if selected then @props.iconSizes.selectedIconSvg else @props.iconSizes.iconSvg
      className: mode + ' cursor-pointer'

  componentDidMount: ->
    @props.map.on 'zoomend', @onMapMove

  componentWillUnmount: ->
    @props.map.off 'zoomend', @onMapMove

  onMapMove: =>
    @forceUpdate()

  shouldComponentUpdate: (nextProps) ->
    return nextProps.id != @props.id

  getMarker: ->
    <Marker map={@props.map}
            position={lat: @props.position.lat, lng: @props.position.lon}
            icon={@getIcon(
              @props.mode + (if @props.thin then " thin" else ""),
              @props.selected,
              @props.map.getZoom())}>
       <Popup options={
         offset: config.map.genericMarker.popup.offset
         closeButton: false
         maxWidth: config.map.genericMarker.popup.maxWidth
         minWidth: config.map.genericMarker.popup.minWidth
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
              className: 'popup'
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
