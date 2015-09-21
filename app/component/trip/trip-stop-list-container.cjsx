React                   = require 'react'
Relay                   = require 'react-relay'
queries                 = require '../../queries'
GtfsUtils               = require '../../util/gtfs'
groupBy                 = require 'lodash/collection/groupBy'
classnames              = require 'classnames'
TripRouteStop           = require './trip-route-stop'

class TripStopListContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  componentDidMount: ->
    @context.getStore('RealTimeInformationStore').addChangeListener @onRealTimeChange

  componentWillUnmount: ->
    @context.getStore('RealTimeInformationStore').removeChangeListener @onRealTimeChange

  onRealTimeChange: =>
    @forceUpdate()

  getStops: ->
    mode = @props.route.route.type.toLowerCase()
    vehicles = @context.getStore('RealTimeInformationStore').vehicles
    vehicle_stops = groupBy vehicles, (vehicle) ->
      "HSL:" + vehicle.next_stop

    stopPassed = false
    @props.route.stops.map (stop) ->
      if vehicle_stops[stop.gtfsId]
        stopPassed = true
      <TripRouteStop key={stop.gtfsId} stop={stop} mode={mode} vehicles={vehicle_stops[stop.gtfsId]} stopPassed={stopPassed}/>

  render: ->
    <div className={classnames "route-stop-list", @props.className}>
      {@getStops()}
    </div>

module.exports = Relay.createContainer(TripStopListContainer, fragments: queries.RouteStopListFragments)
