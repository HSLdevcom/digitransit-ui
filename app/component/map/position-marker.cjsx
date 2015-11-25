React         = require 'react'
isBrowser     = window?
Marker        = if isBrowser then require 'react-leaflet/lib/Marker'
L             = if isBrowser then require 'leaflet'
Icon          = require '../icon/icon'


class PositionMarker extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  @currentLocationIcon:
    if isBrowser
      L.divIcon
        html: Icon.asString 'icon-icon_location_with_user'
        className: 'current-location-marker'
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
    if @context.getStore('PositionStore').getLocationState().hasLocation
      <Marker map={@props.map} position={@getLocation().coordinates} icon={PositionMarker.currentLocationIcon}/>
    else
      return null

module.exports = PositionMarker
