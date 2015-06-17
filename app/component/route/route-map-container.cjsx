React              = require 'react'
Map                = require '../map/map'
RouteLine          = require '../map/route-line'
GtfsUtils          = require '../../util/gtfs'
VehicleMarkerContainer = require '../map/vehicle-marker-container'

class RouteMapContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  componentDidMount: -> 
    @context.getStore('RouteInformationStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('RouteInformationStore').removeChangeListener @onChange

  onChange: (id) =>
    if !id or id == @props.id or id == @props.id.split(':',2).join(':')
      @forceUpdate()

  render: ->
    stops = @context.getStore('RouteInformationStore').getPattern(@props.id).stops
    geometry = @context.getStore('RouteInformationStore').getPatternGeometry(@props.id)
    mode = GtfsUtils.typeToName[@context.getStore('RouteInformationStore').getRoute(@props.id.split(':',2).join(':')).type]

    leafletObj = [<RouteLine key="line" mode={mode} stops={stops} geometry={geometry}/>, <VehicleMarkerContainer key="vehicles" pattern={@props.id}/>]

    <Map className="fullscreen" leafletObjs={leafletObj} fitBounds={true} from={stops[0]} to={stops[stops.length-1]}>
    </Map>

module.exports = RouteMapContainer
