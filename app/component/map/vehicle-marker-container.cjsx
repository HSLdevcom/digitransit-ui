React         = require 'react'
Relay         = require 'react-relay'
queries       = require '../../queries'
isBrowser     = window?
DynamicPopup  = if isBrowser then require './dynamic-popup' else null
RouteMarkerPopup = require './route/route-marker-popup'
Marker        = if isBrowser then require('react-leaflet/lib/Marker').default else null
L             = if isBrowser then require 'leaflet' else null
RealTimeInformationAction = require '../../action/real-time-client-action'
Icon          = require '../icon/icon'

popupOptions =
  offset: [106, 3]
  closeButton: false
  maxWidth: 250
  minWidth: 250
  className: "popup"

class VehicleMarkerContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    router: React.PropTypes.object.isRequired

  getVehicleIcon: (mode, heading) =>
    tailIcon = if heading? then @getTailIcon(mode, heading) else ""

    if !isBrowser then return null
    switch mode
      when "bus" then L.divIcon(html: tailIcon + Icon.asString('icon-icon_bus-live'), className: 'vehicle-icon bus', iconSize: [20, 20], iconAnchor: [10, 10])
      when "tram" then L.divIcon(html: tailIcon + Icon.asString('icon-icon_tram-live'), className: 'vehicle-icon tram', iconSize: [20, 20], iconAnchor: [10, 10])
      when "rail" then L.divIcon(html: tailIcon + Icon.asString('icon-icon_rail-live'), className: 'vehicle-icon rail', iconSize: [20, 20], iconAnchor: [10, 10])
      when "subway" then L.divIcon(html: tailIcon + Icon.asString('icon-icon_subway-live'), className: 'vehicle-icon subway', iconSize: [20, 20], iconAnchor: [10, 10])
      when "ferry" then L.divIcon(html: tailIcon + Icon.asString('icon-icon_ferry-live'), className: 'vehicle-icon ferry', iconSize: [20, 20], iconAnchor: [10, 10])

  getTailIcon: (mode, heading) =>
    return """<span><svg viewBox="0 0 40 40" className="#{mode}" style="position: absolute; top: -20px; left: -20px; fill: currentColor;" width="60px" height="60px">
      <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-icon_vehicle-live-shadow" transform="rotate(#{heading} 20 20)"/>
    </svg></span>"""

  constructor: () ->
    @vehicles = {}

  componentWillMount: ->
    if @props.startRealTimeClient
      @context.executeAction RealTimeInformationAction.startRealTimeClient
    @context.getStore('RealTimeInformationStore').addChangeListener @onChange
    for id, message of @context.getStore('RealTimeInformationStore').vehicles
      # if tripStartTime has been specified, use only the updates for vehicles with matching startTime
      if !@props.trip || message.tripStartTime == @props.trip
        @updateVehicle(id, message)

  componentWillUnmount: ->
    if @props.startRealTimeClient and @context.getStore('RealTimeInformationStore').addChangeListener.client
      @context.executeAction RealTimeInformationAction.stopRealTimeClient @context.getStore('RealTimeInformationStore').addChangeListener.client
    @context.getStore('RealTimeInformationStore').removeChangeListener @onChange

  onChange: (id) =>
    message = @context.getStore('RealTimeInformationStore').getVehicle(id)
    @updateVehicle(id, message)

  updateVehicle: (id, message) =>
    #TODO: cjsx doesn't like objects withing nested elements
    loadingPopupStyle = {"height": 150}

    popup = <Relay.RootContainer
      Component={RouteMarkerPopup}
      route={new queries.FuzzyTripRoute(
        route: message.route
        direction: message.direction
        date: message.operatingDay
        time: message.tripStartTime.substring(0, 2) * 60 * 60 + message.tripStartTime.substring(2, 4) * 60)}
      renderLoading={() => <div className="card" style=loadingPopupStyle><div className="spinner-loader"/></div>}
      renderFetched={(data) =>
        <RouteMarkerPopup {... data} message={message} context={@context}/>
      }/>

    @vehicles[id] =
      <Marker map={@props.map}
              key={id}
              position={lat: message.lat, lng: message.long}
              icon={@getVehicleIcon(message.mode, message.heading)}>
        <span>{message.heading}</span>
        <DynamicPopup options=popupOptions>
          {popup}
        </DynamicPopup>
      </Marker>
    @forceUpdate()

  render: ->
    <div>{((val for key, val of @vehicles))}</div>

module.exports = VehicleMarkerContainer
