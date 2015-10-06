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

STOP_COUNT = 100 # TODO should handle this for real

class RouteListContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  componentDidMount: ->
    @context.getStore('RealTimeInformationStore').addChangeListener @onRealTimeChange

  componentWillUnmount: ->
    @context.getStore('RealTimeInformationStore').removeChangeListener @onRealTimeChange

  onRealTimeChange: =>
    @forceUpdate()

  getDepartures: =>
    departures = []
    departureBuckets = {}
    for edge in @props.stops.stopsByRadius.edges
      stop = edge.node.stop
      d = edge.node.distance // @props.relay.variables.bucketSize
      for departure in stop.stoptimes
        departures.push departure
        bucket = departureBuckets[d] or []
        bucket.push departure
        departureBuckets[d] = bucket
    #departures
    departureBuckets

  render: =>
    bucketSize = @props.relay.variables.bucketSize
    departureBuckets = @getDepartures()
    departureLists = []
    for d, departures of departureBuckets
      distance = d * bucketSize
      if d == 0          
        departureLists.push <div className="departure-list-header padding-vertical-small">
          <FormattedMessage id='under' defaultMessage="under" /> {bucketSize} m
        </div>
      else
        departureLists.push <div className="departure-list-header padding-vertical-small">
          {"#{distance} - #{distance + bucketSize} m"}
        </div>
      if departures
        departureLists.push <DepartureListContainer rowClasses="padding-normal" stoptimes={departures} limit={STOP_COUNT}/>
    <div>{departureLists}</div>

module.exports = Relay.createContainer(RouteListContainer,
  fragments: queries.RouteListContainerFragments
  initialVariables:
    lat: null
    lon: null
    radius: 2000
    numberOfStops: STOP_COUNT
    agency: config.preferredAgency
    bucketSize: 100
    date: moment().format("YYYYMMDD") # TODO check this, what date should be used?
)
