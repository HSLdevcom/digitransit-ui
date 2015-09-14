React         = require 'react'
Relay         = require 'react-relay'
queries       = require '../../queries'
isBrowser     = window?
DynamicPopup  = if isBrowser then require './dynamic-popup' else null
RouteMarkerPopup = require './route-marker-popup'
Marker        = if isBrowser then require 'react-leaflet/lib/Marker' else null
L             = if isBrowser then require 'leaflet' else null
RealTimeInformationAction = require '../../action/real-time-client-action'
Icon          = require '../icon/icon'

popupOptions =
  offset: [106, 3]
  closeButton:false
  maxWidth:250
  minWidth:250
  className:"route-marker-popup"

class VehicleMarkerContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    history: React.PropTypes.object.isRequired

  @vehicleIcons: if !isBrowser then null else
    bus: L.divIcon(html: React.renderToString(React.createElement(Icon, img: 'icon-icon_bus')), className: 'vehicle-icon bus', iconSize: [18, 18], iconAnchor: [9, 9])
    tram: L.divIcon(html: React.renderToString(React.createElement(Icon, img: 'icon-icon_tram')), className: 'vehicle-icon tram', iconSize: [18, 18], iconAnchor: [9, 9])
    rail: L.divIcon(html: React.renderToString(React.createElement(Icon, img: 'icon-icon_rail')), className: 'vehicle-icon rail', iconSize: [18, 18], iconAnchor: [9, 9])
    subway: L.divIcon(html: React.renderToString(React.createElement(Icon, img: 'icon-icon_subway')), className: 'vehicle-icon subway', iconSize: [18, 18], iconAnchor: [9, 9])
    ferry: L.divIcon(html: React.renderToString(React.createElement(Icon, img: 'icon-icon_ferry')), className: 'vehicle-icon ferry', iconSize: [18, 18], iconAnchor: [9, 9])

  constructor: () ->
    @vehicles = {}

  componentWillMount: ->
    if @props.startRealTimeClient
      @context.executeAction RealTimeInformationAction.startRealTimeClient
    @context.getStore('RealTimeInformationStore').addChangeListener @onChange
    for id, message of @context.getStore('RealTimeInformationStore').vehicles
      if !@props.trip || message.tripStartTime == @props.trip
        @updateVehicle(id, message)

  componentWillUnmount: ->
    if @props.startRealTimeClient and @context.getStore('RealTimeInformationStore').addChangeListener.client
      @context.executeAction RealTimeInformationAction.stopRealTimeClient @context.getStore('RealTimeInformationStore').addChangeListener.client
    @context.getStore('RealTimeInformationStore').removeChangeListener @onChange

  onChange: (id) =>
    message = @context.getStore('RealTimeInformationStore').getVehicle(id)
    @updateVehicle(id, message)

  updateVehicle: (id, message) ->
    popup = <Relay.RootContainer
      Component={RouteMarkerPopup}
      route={new queries.RouteMarkerPopupRoute(
        route: message.route
        direction: message.direction
        date: message.operatingDay
        time: message.tripStartTime.substring(0,2) * 60 * 60 + message.tripStartTime.substring(2,4) * 60)}
      renderFetched={(data) =>
        <RouteMarkerPopup trip={data.trip}
                          message={message}
                          context={@context}
                          route={message.route}
                          direction={message.direction}
                          date={message.operatingDay}
                          time={message.tripStartTime.substring(0,2) * 60 * 60 + message.tripStartTime.substring(2,4) * 60}/>
      }/>

    @vehicles[id] =
      <Marker map={@props.map}
              key={id}
              position={lat: message.lat, lng: message.long}
              icon={VehicleMarkerContainer.vehicleIcons[message.mode]}>
        <DynamicPopup options=popupOptions>
          {popup}
        </DynamicPopup>
      </Marker>
    @forceUpdate()

  render: ->
    <div>{((val for key, val of @vehicles))}</div>

module.exports = VehicleMarkerContainer
