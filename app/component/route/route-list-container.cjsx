# Shows the nearby routes in a list

React      = require 'react'
Relay      = require 'react-relay'
queries    = require '../../queries'
RouteStop  = require './route-stop'
DepartureListContainer = require '../departure/departure-list-container2'
Link       = require 'react-router/lib/Link'
sortBy     = require 'lodash/sortBy'
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

  filterEligibleDepartures: (departures) =>
    mode = @context.getStore('ModeStore').getMode()
    filtered = []
    for departure in departures
      unless departure.pattern.route.type not in mode or departure.stoptimes[0]?.pickupType == "NONE"
        filtered.push departure
    filtered

  getDepartures: =>
    departures = []
    seenDepartures = {}
    for edge in @props.stops.stopsByRadius.edges
      stop = edge.node.stop
      for departure in @filterEligibleDepartures stop.stoptimes
        departures.push
          distance: edge.node.distance
          pattern: departure.pattern
          stop: stop
          seenKey: departure.pattern.route.gtfsId + ":" + departure.pattern.headsign + ":"
          stoptimes: departure.stoptimes
          departure: departure

    uniqueDepartures = []
    for departure in departures
      if seenDepartures[departure.seenKey]
      else
        uniqueDepartures.push departure
        seenDepartures[departure.seenKey] = true

    uniqueDepartures

  render: =>
    bucketSize = config.nearbyRoutes.bucketSize
    departures = @getDepartures()
    departures = departures.map (d) => d.departure

    <div>
      <div className="departure-list-header padding-vertical-small">
        <span className="right">
          <FormattedMessage
            id='stop-number'
            defaultMessage="Stop number"/>
        </span>
      </div>

      <DepartureListContainer
          rowClasses="padding-normal underline"
          routeLinks={true}
          stoptimes={departures}
          showStops={true}/>
    </div>

module.exports = Relay.createContainer(RouteListContainer,
  fragments: queries.RouteListContainerFragments
  initialVariables:
    lat: null
    lon: null
    radius: config.nearbyRoutes.radius
    numberOfStops: STOP_COUNT
    agency: config.preferredAgency
)
