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

STOP_COUNT = 15 # TODO should handle this for real

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
    for edge in @props.stops.stopsByRadius.edges
      stop = edge.node.stop
      for departure in stop.stoptimes
        departures.push departure
    departures

  render: =>
    <DepartureListContainer rowClasses="padding-normal" stoptimes={@getDepartures()} limit={STOP_COUNT}/>

module.exports = Relay.createContainer(RouteListContainer,
  fragments: queries.RouteListContainerFragments
  initialVariables:
    lat: null
    lon: null
    radius: 2000
    numberOfStops: STOP_COUNT
    agency: config.preferredAgency
    date: moment().format("YYYYMMDD") # TODO check this, what date should be used?
)
