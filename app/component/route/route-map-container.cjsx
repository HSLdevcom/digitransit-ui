React              = require 'react'
Relay              = require 'react-relay'
queries            = require '../../queries'
Map                = require '../map/map'
RouteLine          = require '../map/route-line'
GtfsUtils          = require '../../util/gtfs'
VehicleMarkerContainer = require '../map/vehicle-marker-container'

class RouteMapContainer extends React.Component
  render: ->
    stops = @props.route.stops
    geometry = @props.route.geometry
    mode = @props.route.route.type

    leafletObj = [<RouteLine key="line" mode={mode} stops={stops} geometry={geometry}/>, <VehicleMarkerContainer key="vehicles" pattern={@props.route.code}/>]

    <Map className="fullscreen" leafletObjs={leafletObj} fitBounds={true} from={stops[0]} to={stops[stops.length-1]}>
    </Map>

module.exports = Relay.createContainer(RouteMapContainer, fragments: queries.RouteMapFragments)
