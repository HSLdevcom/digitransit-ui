# Shows the nearby routes in a list

React      = require 'react'
Relay      = require 'react-relay'
queries    = require '../../queries'
RouteStop  = require './route-stop'
DepartureListContainer = require '../stop-cards/departure-list-container'
Link       = require 'react-router/lib/Link'
sortBy     = require 'lodash/collection/sortBy'
config     = require '../../config'
moment     = require 'moment'
classNames = require 'classnames'
intl       = require 'react-intl'

FormattedMessage = intl.FormattedMessage

STOP_COUNT = 30

class RouteListContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  componentDidMount: ->
    @context.getStore('RealTimeInformationStore').addChangeListener @onRealTimeChange
    @context.getStore('ModeStore').addChangeListener @onModeChange

  componentWillUnmount: ->
    @context.getStore('RealTimeInformationStore').removeChangeListener @onRealTimeChange
    @context.getStore('ModeStore').removeChangeListener @onModeChange

  onRealTimeChange: =>
    @forceUpdate()

  onModeChange: =>
    @forceUpdate()

  sortBuckets: (departureBuckets) =>
    buckets = []
    for d of departureBuckets
      buckets.push d
    buckets = sortBy buckets, (d) -> parseInt d, 10
    
    sortedBuckets = []
    for d in buckets
      sortedBuckets.push [d, departureBuckets[d]]
    sortedBuckets

  limitBuckets: (departureBuckets, count) =>
    limitedBuckets = []
    count = 0
    for [d, departures] in departureBuckets
      limitedBuckets.push [d, departures]
      count += departures.length
      if count > STOP_COUNT
        break
    return limitedBuckets
    

  getDepartures: =>
    departureBuckets = {}
    seenDepartures = {}
    mode = @context.getStore('ModeStore').getMode()
    for edge in @props.stops.stopsByRadius.edges
      stop = edge.node.stop
      d = edge.node.distance // config.nearbyRoutes.bucketSize
      for departure in stop.stoptimes
        seenKey = departure.pattern.route.gtfsId + ":" + departure.pattern.headsign
        unless seenDepartures[seenKey] or departure.pattern.route.type not in mode
          bucket = departureBuckets[d] or []
          bucket.push departure
          departureBuckets[d] = bucket
          seenDepartures[seenKey] = true
    @limitBuckets @sortBuckets departureBuckets, STOP_COUNT

  render: =>
    bucketSize = config.nearbyRoutes.bucketSize
    departureBuckets = @getDepartures()
    departureLists = []
    for [d, departures] in departureBuckets
      distance = d * bucketSize
      if distance == 0
        departureLists.push <div key={"h"+d} className="departure-list-header padding-vertical-small">
          <FormattedMessage id='under' defaultMessage="under" /> {"#{bucketSize} m"}
        </div>
      else
        departureLists.push <div key={"h"+d} className="departure-list-header padding-vertical-small">
          {"#{distance} - #{distance + bucketSize} m"}
        </div>
      if departures
        departureLists.push <DepartureListContainer key={d} rowClasses="padding-normal" stoptimes={departures}/>
    <div>{departureLists}</div>

module.exports = Relay.createContainer(RouteListContainer,
  fragments: queries.RouteListContainerFragments
  initialVariables:
    lat: null
    lon: null
    radius: config.nearbyRoutes.radius
    numberOfStops: STOP_COUNT
    agency: config.preferredAgency
    date: moment().format("YYYYMMDD") # TODO check this, what date should be used?
)
