React         = require 'react'
isBrowser     = window?
Marker        = if isBrowser then require('react-leaflet/lib/Marker').default
L             = if isBrowser then require 'leaflet'
Icon          = require '../icon/icon'


class PositionMarker extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  @currentLocationIcon:
    if isBrowser
      L.divIcon
        html: Icon.asString 'icon-icon_mapMarker-location-animated'
        className: 'current-location-marker'
        iconSize: [40, 40]
    else
      null

  getLocation: ->
    coordinates = @context.getStore('PositionStore').getLocationState()
    if coordinates and (coordinates.lat != 0 || coordinates.lon != 0)
      coordinates: [coordinates.lat, coordinates.lon]

  componentDidMount: ->
    @context.getStore('PositionStore').addChangeListener @onPositionChange

  componentWillUnmount: ->
    @context.getStore('PositionStore').removeChangeListener @onPositionChange

  onPositionChange: =>
    @forceUpdate()

  render: ->
    if @getLocation()
      <Marker
        map={@props.map}
        layerContainer={@props.layerContainer}
        zIndexOffset=5
        position={@getLocation().coordinates}
        icon={PositionMarker.currentLocationIcon}/>
    else
      return null

module.exports = PositionMarker
