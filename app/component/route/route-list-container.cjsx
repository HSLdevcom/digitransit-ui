# Shows the nearby routes in a list

React      = require 'react'
Relay      = require 'react-relay'
queries    = require '../../queries'
NextDeparturesList    = require '../departure/next-departures-list'
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

  getNextDepartures: =>
    mode = @context.getStore('ModeStore').getMode()
    departures = []
    seenDepartures = {}
    for edge in @props.stops.stopsByRadius.edges
      stop = edge.node.stop
      departures.push edge.node

    nextDepartures = []

    for stopAtDistance in departures
      keepStoptimes = []
      for stoptime in stopAtDistance.stop.stoptimes
        seenKey =  stoptime.pattern.route.gtfsId + ":" + stoptime.pattern.headsign
        isSeen = seenDepartures[seenKey]
        isModeIncluded = stoptime.pattern.route.type in mode
        isPickup = stoptime.stoptimes[0]?.pickupType != "NONE"
        if !isSeen and isModeIncluded and isPickup
          keepStoptimes.push stoptime
          seenDepartures[seenKey] = true
      nextDepartures.push
        distance: stopAtDistance.distance
        stoptimes: keepStoptimes

    nextDepartures

  now: =>
    @context.getStore('TimeStore').getCurrentTime()

  render: =>
    <NextDeparturesList departures={@getNextDepartures()} currentTime={@now().unix()} />

module.exports = Relay.createContainer(RouteListContainer,
  fragments: queries.RouteListContainerFragments
  initialVariables:
    lat: null
    lon: null
    radius: config.nearbyRoutes.radius
    numberOfStops: STOP_COUNT
    agency: config.preferredAgency
)
