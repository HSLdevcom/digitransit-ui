# Shows the stops that a single pattern of a route uses,
# and all vehicles on that route for the same direction (but all patterns, not just this).

React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
RouteStop             = require './route-stop'
GtfsUtils             = require '../../util/gtfs'
groupBy               = require 'lodash/collection/groupBy'

class RouteStopListContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  componentDidMount: ->
    @context.getStore('RealTimeInformationStore').addChangeListener @onRealTimeChange

  componentWillUnmount: ->
    @context.getStore('RealTimeInformationStore').removeChangeListener @onRealTimeChange

  onRealTimeChange: =>
    @forceUpdate()

  getStops: () =>
    mode = @props.route.route.type.toLowerCase()
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

    @props.route.stops.forEach (stop) ->
      stopObjs.push <RouteStop key={stop.gtfsId} stop={stop} mode={mode} vehicles={vehicle_stops[stop.gtfsId]}/>

    stopObjs

  render: =>
    <div className="route-stop-list">
      {@getStops()}
    </div>

module.exports = Relay.createContainer(RouteStopListContainer, fragments: queries.RouteStopListFragments)
