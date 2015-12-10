# Shows the stops that a single pattern of a route uses,
# and all vehicles on that route for the same direction (but all patterns, not just this).

React                 = require 'react'
ReactDOM              = require 'react-dom'
Relay                 = require 'react-relay'
queries               = require '../../queries'
RouteStop             = require './route-stop'
GtfsUtils             = require '../../util/gtfs'
groupBy               = require 'lodash/collection/groupBy'
cx                    = require 'classnames'
geoUtils              = require '../../util/geo-utils'
config                = require '../../config'

class RouteStopListContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  getNearestStopDistance: (stops) =>
    state = @context.getStore('PositionStore').getLocationState()
    if state.hasLocation == true
      geoUtils.getDistanceToNearestStop(state.lat, state.lon, stops)

  componentDidMount: ->
    @context.getStore('RealTimeInformationStore').addChangeListener @onRealTimeChange
    ReactDOM.findDOMNode(@refs.nearestStop).scrollIntoView(false) if @refs.nearestStop

  componentWillUnmount: ->
    @context.getStore('RealTimeInformationStore').removeChangeListener @onRealTimeChange

  onRealTimeChange: =>
    @forceUpdate()

  getStops: () ->
    nearest = @getNearestStopDistance(@props.pattern.stops)
    mode = @props.pattern.route.type.toLowerCase()
    vehicles = @context.getStore('RealTimeInformationStore').vehicles
    vehicle_stops = groupBy vehicles, (vehicle) ->
      "HSL:" + vehicle.next_stop

    stopObjs = []

    @props.pattern.stops.forEach (stop) ->
      isNearest = nearest?.stop.gtfsId == stop.gtfsId
      stopObjs.push <RouteStop
        key={stop.gtfsId}
        stop={stop}
        mode={mode}
        vehicles={vehicle_stops[stop.gtfsId]}
        distance={nearest.distance if isNearest and nearest.distance < config.nearestStopDistance.maxShownDistance}
        ref={"nearestStop" if isNearest}
      />
    stopObjs

  render: ->
    <div className={cx "route-stop-list", @props.className}>
      {@getStops()}
    </div>

module.exports = Relay.createContainer(RouteStopListContainer, fragments: queries.RouteStopListFragments)
