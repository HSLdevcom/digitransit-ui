React                   = require 'react'
Relay                   = require 'react-relay'
queries                 = require '../../queries'
GtfsUtils               = require '../../util/gtfs'
groupBy                 = require 'lodash/groupBy'
cx                      = require 'classnames'
TripRouteStop           = require('./TripRouteStop').default
isEmpty                 = require 'lodash/isEmpty'
moment                  = require 'moment'
geoUtils                = require '../../util/geo-utils'
config                  = require '../../config'

class TripStopListContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  getNearestStopDistance: (stops) =>
    state = @context.getStore('PositionStore').getLocationState()
    if state.hasLocation == true
      geoUtils.getDistanceToNearestStop(state.lat, state.lon, stops)

  componentDidMount: ->
    @context.getStore('RealTimeInformationStore').addChangeListener @onRealTimeChange

  componentWillUnmount: ->
    @context.getStore('RealTimeInformationStore').removeChangeListener @onRealTimeChange

  onRealTimeChange: =>
    @forceUpdate()

  getStops: ->
    nearest = @getNearestStopDistance(@props.trip.stoptimes.map((stoptime) -> stoptime.stop))
    mode = @props.trip.route.type.toLowerCase()
    vehicles = @context.getStore('RealTimeInformationStore').vehicles
    vehicle = !isEmpty(vehicles) && vehicles[Object.keys(vehicles)[0]]

    currentTime = @context.getStore('TimeStore').getCurrentTime()
    currentTimeFromMidnight = currentTime.clone().diff(currentTime.clone().startOf('day'), 'seconds')
    stopPassed = true

    @props.trip.stoptimes.map (stoptime, index) ->
      nextStop = "HSL:" + vehicle.next_stop
      if nextStop == stoptime.stop.gtfsId
        stopPassed = false
      else if vehicle.stop_index == index
        # tram: next_stop is undefined
        stopPassed = false
      else if (stoptime.realtimeDeparture > currentTimeFromMidnight && isEmpty(vehicle))
        stopPassed = false

      <TripRouteStop
        key={stoptime.stop.gtfsId}
        stop={stoptime.stop}
        mode={mode}
        vehicle={if nextStop == stoptime.stop.gtfsId then vehicle}
        stopPassed={stopPassed}
        realtime={stoptime.realtime}
        distance={if nearest?.stop.gtfsId == stoptime.stop.gtfsId and  nearest.distance < config.nearestStopDistance.maxShownDistance then nearest.distance}
        realtimeDeparture={stoptime.realtimeDeparture}
        currentTimeFromMidnight={currentTimeFromMidnight}/>

  render: ->
    <div className={cx "route-stop-list", @props.className}>
      {@getStops()}
    </div>

module.exports = Relay.createContainer(TripStopListContainer, fragments: queries.TripStopListFragments)
