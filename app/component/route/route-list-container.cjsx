# Shows the nearby routes in a list

React      = require 'react'
Relay      = require 'react-relay'
queries    = require '../../queries'
RouteStop  = require './route-stop'
DepartureListContainer = require '../departure/departure-list-container'
Link       = require 'react-router/lib/Link'
sortBy     = require 'lodash/collection/sortBy'
config     = require '../../config'
moment     = require 'moment'
intl       = require 'react-intl'

FormattedMessage = intl.FormattedMessage

STOP_COUNT = 30

class RouteListContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  componentDidMount: ->
    @context.getStore('ModeStore').addChangeListener @onModeChange

  componentWillUnmount: ->
    @context.getStore('ModeStore').removeChangeListener @onModeChange

  onModeChange: =>
    @forceUpdate()

  limitBuckets: (departureBuckets, count) =>
    limitedBuckets = []
    count = 0
    for d, departures of departureBuckets
      limitedBuckets.push [d, departures]
      count += departures.length
      if count > STOP_COUNT
        break
    return limitedBuckets

  getDepartures: =>
    departureBuckets = []
    seenDepartures = {}
    mode = @context.getStore('ModeStore').getMode()
    for edge in @props.stops.stopsByRadius.edges
      stop = edge.node.stop
      d = edge.node.distance // config.nearbyRoutes.bucketSize
      for departure in stop.stoptimes
        seenKey = departure.pattern.route.gtfsId + ":" + departure.pattern.headsign
        unless seenDepartures[seenKey] or departure.pattern.route.type not in mode or departure.stoptimes[0]?.pickupType == "NONE"
          bucket = departureBuckets[d] or []
          bucket.push departure
          departureBuckets[d] = bucket
          seenDepartures[seenKey] = true
    @limitBuckets departureBuckets, STOP_COUNT

  render: =>
    bucketSize = config.nearbyRoutes.bucketSize
    departureBuckets = @getDepartures()
    departureLists = []
    for [d, departures] in departureBuckets
      distance = d * bucketSize
      if distance == 0
        distanceLabel = <FormattedMessage
          id='distance-under'
          defaultMessage="Distance under {distance} m"
          values={
            distance: bucketSize
          }/>
      else
        distanceLabel = <FormattedMessage
          id='distance-between'
          defaultMessage="Distance {distance1} m — {distance2} m"
          values={
            distance1: distance
            distance2: distance + bucketSize
          }/>

      departureLists.push <div key={"h" + d} className="departure-list-header padding-vertical-small">
        {distanceLabel}
        <span className="right">
          <FormattedMessage
            id='stop-number'
            defaultMessage="Stop number"/>
        </span>
      </div>

      if departures
        departureLists.push <DepartureListContainer
          key={d}
          rowClasses="padding-normal underline"
          routeLinks={true}
          stoptimes={departures}
          showStops={true}/>
    <div>{departureLists}</div>

module.exports = Relay.createContainer(RouteListContainer,
  fragments: queries.RouteListContainerFragments
  initialVariables:
    lat: null
    lon: null
    radius: config.nearbyRoutes.radius
    numberOfStops: STOP_COUNT
    agency: config.preferredAgency
)
