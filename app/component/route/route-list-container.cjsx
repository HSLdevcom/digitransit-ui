# Shows the nearby routes in a list

React      = require 'react'
Relay      = require 'react-relay'
queries    = require '../../queries'
RouteStop  = require './route-stop'
Departure  = require '../stop-cards/departure'
Link       = require 'react-router/lib/Link'
sortBy     = require 'lodash/collection/sortBy'
config     = require '../../config'
moment     = require 'moment'
classNames = require 'classnames'

STOP_COUNT = 5

class RouteListContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  componentDidMount: ->
    @context.getStore('RealTimeInformationStore').addChangeListener @onRealTimeChange

  componentWillUnmount: ->
    @context.getStore('RealTimeInformationStore').removeChangeListener @onRealTimeChange

  onRealTimeChange: =>
    @forceUpdate()

  getRoutes: =>
    currentTime = new Date().getTime() / 1000

    departures = []
    for edge in @props.stops.stopsByRadius.edges
      stop = edge.node.stop
      for departure in stop.stoptimesForPatterns
        if departure.stoptimes
          stoptime = departure.stoptimes[0]
          departure.realtime = stoptime.realtime
          departure.stoptime = stoptime.serviceDay + stoptime.realtimeDeparture
          departures.push departure

    departures = sortBy(departures, "stoptime")
    routeObjs = []
    for departure in departures
      id = "#{departure.pattern.code}:#{departure.stoptime}"
      routeObjs.push <Link to="#{process.env.ROOT_PATH}linjat/#{departure.pattern.code}" key={id}>
        <Departure currentTime={currentTime} departure={departure}/>
      </Link>
    routeObjs

  render: =>
    <div className={classNames("departure-list", @props.className)} onScroll={if @props.infiniteScroll and window? then @scrollHandler else null}>
      {@getRoutes()}
    </div>

module.exports = Relay.createContainer(RouteListContainer,
  fragments: queries.RouteListContainerFragments
  initialVariables:
    lat: null
    lon: null
    radius: 2000
    numberOfStops: STOP_COUNT
    agency: config.preferredAgency
)
