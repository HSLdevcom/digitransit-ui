# Shows the stops that a single pattern of a route uses,
# and all vehicles on that route for the same direction (but all patterns, not just this).

React                 = require 'react'
RouteStop             = require './route-stop'
GtfsUtils             = require '../../util/gtfs'
groupBy               = require 'lodash/collection/groupBy'

class RouteStopListContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  componentDidMount: ->
    @context.getStore('RouteInformationStore').addChangeListener @onChange
    @context.getStore('RealTimeInformationStore').addChangeListener @onRealTimeChange

  componentWillUnmount: ->
    @context.getStore('RouteInformationStore').removeChangeListener @onChange
    @context.getStore('RealTimeInformationStore').removeChangeListener @onRealTimeChange

  onChange: (id) =>
    if !id or id == @props.id or id == @props.id.split(':',2).join(':')
      @forceUpdate()

  onRealTimeChange: =>
    @forceUpdate()

  getStops: (id) =>
    pattern = @context.getStore('RouteInformationStore').getPattern(id)
    unless pattern
      return []
    stops = @context.getStore('RouteInformationStore').getPattern(id).stops
    mode = GtfsUtils.typeToName[@context.getStore('RouteInformationStore').getRoute(@props.id.split(':',2).join(':')).type]
    vehicles = @context.getStore('RealTimeInformationStore').vehicles
    vehicle_stops = groupBy vehicles, (vehicle) ->
      "HSL:" + vehicle.next_stop

    stopObjs = []

    stopObjs.push <div key="header" className="route-stop row">
      <div className="columns small-3 route-stop-now">
        Juuri Nyt
      </div>
      <div className="columns small-6 route-stop-name ">
        Pysäkki
      </div>
      <div className="columns small-2 route-stop-code">
        Pysäkkinumero
      </div>
      <div className="columns small-1 route-stop-mins">
        Min
      </div>
    </div>

    stops.forEach (stop) ->
      stopObjs.push <RouteStop key={stop.id} stop={stop} mode={mode} vehicles={vehicle_stops[stop.id]}/>

    stopObjs

  render: =>
    <div className="route-stop-list">
      {@getStops(@props.id)}
    </div>

module.exports = RouteStopListContainer
