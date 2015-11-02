# Shows the stops that a single pattern of a route uses,
# and all vehicles on that route for the same direction (but all patterns, not just this).

React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
RouteStop             = require './route-stop'
GtfsUtils             = require '../../util/gtfs'
groupBy               = require 'lodash/collection/groupBy'
cx                    = require 'classnames'
geoUtils              = require '../../util/geo-utils'

class RouteStopListContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  setNearestStopDistance: (stops) =>
    state = @context.getStore('PositionStore').getLocationState()
    if state.hasLocation == true
      geoUtils.setDistanceToNearestStop(state.lat, state.lon, stops)

  componentDidMount: ->
    @context.getStore('RealTimeInformationStore').addChangeListener @onRealTimeChange

  componentWillUnmount: ->
    @context.getStore('RealTimeInformationStore').removeChangeListener @onRealTimeChange

  onRealTimeChange: =>
    @forceUpdate()

  getStops: () =>
    mode = @props.pattern.route.type.toLowerCase()
    vehicles = @context.getStore('RealTimeInformationStore').vehicles
    vehicle_stops = groupBy vehicles, (vehicle) ->
      "HSL:" + vehicle.next_stop

    stopObjs = []

    @props.pattern.stops.forEach (stop) ->
      stopObjs.push <RouteStop key={stop.gtfsId} stop={stop} mode={mode} vehicles={vehicle_stops[stop.gtfsId]}/>

    stopObjs

  render: =>
    @setNearestStopDistance(@props.pattern.stops)
    <div className={cx "route-stop-list", @props.className}>
      {@getStops()}
    </div>

module.exports = Relay.createContainer(RouteStopListContainer, fragments: queries.RouteStopListFragments)
