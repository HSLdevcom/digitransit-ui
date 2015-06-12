React         = require 'react'
isBrowser     = window?
Marker        = if isBrowser then require 'react-leaflet/lib/Marker' else null
L             = if isBrowser then require 'leaflet' else null
RealTimeInformationAction = require '../../action/real-time-client-action'
Icon          = require '../icon/icon'


class VehicleMarkerContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  @busIcon: if isBrowser then L.divIcon(html: React.renderToString(React.createElement(Icon, img: 'icon-icon_bus'))) else null

  constructor: () ->
    @vehicles = {}

  componentDidMount: ->
    @context.executeAction RealTimeInformationAction.startRealTimeClient
    @context.getStore('RealTimeInformationStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.executeAction RealTimeInformationAction.stopRealTimeClient @context.getStore('RealTimeInformationStore').addChangeListener.client
    @context.getStore('RealTimeInformationStore').removeChangeListener @onChange

  onChange: (id) =>
    message = @context.getStore('RealTimeInformationStore').getVehicle(id)
    @vehicles[id] = <Marker map={@props.map} key={id} position={lat: message.lat, lng: message.long} icon={VehicleMarkerContainer.busIcon}/>
    @forceUpdate()

  render: ->
    <div>{((val for key, val of @vehicles))}</div>

module.exports = VehicleMarkerContainer