React         = require 'react'
isBrowser     = window?
DynamicPopup  = if isBrowser then require './dynamic-popup' else null
RouteMarkerPopup = require './route-marker-popup'
Marker        = if isBrowser then require 'react-leaflet/lib/Marker' else null
L             = if isBrowser then require 'leaflet' else null
RealTimeInformationAction = require '../../action/real-time-client-action'
Icon          = require '../icon/icon'
moment        = require 'moment'


class VehicleMarkerContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    router: React.PropTypes.func.isRequired

  @vehicleIcons: if !isBrowser then null else 
    bus: L.divIcon(html: React.renderToString(React.createElement(Icon, img: 'icon-icon_bus')), className: 'vehicle-icon')

  constructor: () ->
    @vehicles = {}

  componentDidMount: ->
    if @props.startRealTimeClient
      @context.executeAction RealTimeInformationAction.startRealTimeClient
    @context.getStore('RealTimeInformationStore').addChangeListener @onChange

  componentWillUnmount: ->
    if @props.startRealTimeClient and @context.getStore('RealTimeInformationStore').addChangeListener.client
      @context.executeAction RealTimeInformationAction.stopRealTimeClient @context.getStore('RealTimeInformationStore').addChangeListener.client
    @context.getStore('RealTimeInformationStore').removeChangeListener @onChange

  onChange: (id) =>
    message = @context.getStore('RealTimeInformationStore').getVehicle(id)
    popup =
      <DynamicPopup options={{offset: [106, 3], closeButton:false, maxWidth:250, minWidth:250, className:"route-marker-popup"}}>
        <RouteMarkerPopup route={message.line} direction={parseInt(message.dir)-1} trip={message.start} date={moment().format("YYYYMMDD")} context={@context}/>
      </DynamicPopup>
    @vehicles[id] = <Marker map={@props.map} key={id} position={lat: message.lat, lng: message.long} icon={VehicleMarkerContainer.vehicleIcons[message.mode]}>{popup}</Marker>
    @forceUpdate()

  render: ->
    <div>{((val for key, val of @vehicles))}</div>

module.exports = VehicleMarkerContainer