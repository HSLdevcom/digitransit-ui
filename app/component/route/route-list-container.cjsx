# Shows the nearby routes in a list

React      = require 'react'
Relay      = require 'react-relay'
queries    = require '../../queries'
RouteStop  = require './route-stop'
RouteNumber           = require '../departure/route-number'
RouteDestination      = require '../departure/route-destination'
DepartureTime         = require '../departure/departure-time'
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
    @context.getStore('TimeStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('ModeStore').removeChangeListener @onModeChange
    @context.getStore('TimeStore').removeChangeListener @onChange

  onModeChange: =>
    @forceUpdate()

  filterEligibleDepartures: (departures) =>
    mode = @context.getStore('ModeStore').getMode()
    filtered = []
    for departure in departures
      unless departure.stop.pattern.route.type not in mode or departure.stop.stoptimes[0]?.pickupType == "NONE"
        filtered.push departure
    filtered

  getDepartures: =>
    mode = @context.getStore('ModeStore').getMode()
    console.log mode
    departures = []
    seenDepartures = {}
    for edge in @props.stops.stopsByRadius.edges
      stop = edge.node.stop
      #for departure in @filterEligibleDepartures stop.stoptimes
      departures.push edge.node

    for stopAtDistance in departures
      keepStoptimes = []
      l = stopAtDistance.stop.stoptimes.length
      for stoptime in stopAtDistance.stop.stoptimes
        seenKey =  stoptime.pattern.route.gtfsId + ":" + stoptime.pattern.headsign
        isSeen = seenDepartures[seenKey]
        isModeIncluded = stoptime.pattern.route.type in mode
        isPickup = stoptime.stoptimes[0]?.pickupType != "NONE"
        if seenKey.indexOf('HSL:1001:Käpylä') != -1
          console.log seenKey + ' ' + isSeen + ' ' + isModeIncluded + ' ' + isPickup
        if !isSeen and isModeIncluded and isPickup
          keepStoptimes.push stoptime
          seenDepartures[seenKey] = true
      stopAtDistance.stop.stoptimes = keepStoptimes
      #console.log stopAtDistance.stop.stoptimes.length + ' < ' + l

    departures

  now: =>
    @context.getStore('TimeStore').getCurrentTime()
    
  render: =>
    bucketSize = config.nearbyRoutes.bucketSize
    departures = @getDepartures()
    stoptimeObjs = []

    currentTime = @now().unix()

    for stopAtDistance in departures
      for stoptime in stopAtDistance.stop.stoptimes
        departureTimes = []
        for departure in stoptime.stoptimes
          canceled =  departure.realtimeState == 'CANCELED' or (window.mock && departure.realtimeDeparture % 40 == 0)
          departureTimes.push <DepartureTime
            key={Math.random()}
            departureTime={departure.serviceDay + departure.realtimeDeparture}
            realtime={departure.realtime}
            currentTime={currentTime}
            canceled={canceled} />

        stoptimeObjs.push <Link to="/linjat/#{stoptime.pattern.code}" key={stoptime.pattern.code}>
          <div className="stop-departure-row padding-normal border-bottom">
            <span className="distance">{(stopAtDistance.distance // 10) * 10 + "m"}</span>
            <RouteNumber
              mode={stoptime.pattern.route.type}
              realtime={false}
              text={stoptime.pattern.route.shortName} />
            <RouteDestination
              mode={stoptime.pattern.route.type}
              destination={stoptime.pattern.headsign or stoptime.pattern.route.longName} />
            {departureTimes}
          </div>
        </Link>

    <div>
      <div className="departure-list-header padding-vertical-small">
        <span className="right">
          <FormattedMessage
            id='stop-number'
            defaultMessage="Stop number"/>
        </span>
      </div>

      {stoptimeObjs}
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
