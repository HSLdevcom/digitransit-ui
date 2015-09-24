React             = require 'react'
Relay             = require 'react-relay'
queries           = require '../../queries'
StopCardContainer = require './stop-card-container'
StopCardList      = require './stop-card-list'
config            = require '../../config'

STOP_COUNT = 5
DEPARTURES_COUNT = 5

class StopCardListContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  componentDidMount: =>
    @context.getStore('LocationStore').addChangeListener @onChange
    @onChange()

  componentWillUnmount: ->
    @context.getStore('LocationStore').removeChangeListener @onChange

  onChange: =>
    coordinates = @context.getStore('LocationStore').getLocationState()
    if coordinates and (coordinates.lat != 0 || coordinates.lon != 0)
      @props.relay.setVariables
        lat: coordinates.lat
        lon: coordinates.lon

  addStops: =>
    if !@props.stops.stopsByRadius.pageInfo.hasNextPage
      radius = @props.relay.variables.radius + 2000
    else
      radius = @props.relay.variables.radius
    @props.relay.setVariables
      numberOfStops: @props.relay.variables.numberOfStops + STOP_COUNT
      radius: radius

  getStopCards: =>
    stopCards = []
    for edge in @props.stops.stopsByRadius.edges
      stopCards.push <StopCardContainer key={edge.node.stop.gtfsId} stop={edge.node} departures=DEPARTURES_COUNT />
    stopCards

  render: =>
    <StopCardList addStops=@addStops>
    	{@getStopCards()}
    </StopCardList>

module.exports = Relay.createContainer(StopCardListContainer,
  fragments: queries.StopListContainerFragments
  initialVariables:
    lat: null
    lon: null
    radius: 2000
    numberOfStops: STOP_COUNT
    agency: config.preferredAgency
)
