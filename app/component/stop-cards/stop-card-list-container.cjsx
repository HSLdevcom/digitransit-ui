React             = require 'react'
Relay             = require 'react-relay'
queries           = require '../../queries'
StopCardContainer = require './stop-card-container'
StopCardList      = require './stop-card-list'
config            = require '../../config'

STOP_COUNT = 10
DEPARTURES_COUNT = 5

class StopCardListContainer extends React.Component
  constructor: ->
    super
    @state = numberOfStops: STOP_COUNT

  addStops: =>
    @setState
      numberOfStops: @state.numberOfStops + STOP_COUNT

  getStopCards: =>
    stopCards = []
    for stop in @props.stops.stopsByRadius.slice(0,@state.numberOfStops)
      stopCards.push <StopCardContainer key={stop.stop.gtfsId} stop={stop} departures=DEPARTURES_COUNT />
    stopCards

  render: =>
    <StopCardList addStops=@addStops>
    	{@getStopCards()}
    </StopCardList>

module.exports = Relay.createContainer(StopCardListContainer,
  fragments: queries.StopListContainerFragments
  initialVariables:
    lat: 60.2
    lon: 24.9393
    radius: 500.1
    agency: config.preferredAgency
)
