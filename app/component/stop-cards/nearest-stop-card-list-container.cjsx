React             = require 'react'
Relay             = require 'react-relay'
queries           = require '../../queries'
StopCardContainer = require './stop-card-container'
StopCardList      = require './stop-card-list'
config            = require '../../config'
moment            = require 'moment'

STOP_COUNT = 5
DEPARTURES_COUNT = 5

class NearStopCardListContainer extends React.Component
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

module.exports = Relay.createContainer(NearStopCardListContainer,
  fragments: queries.NearStopListContainerFragments
  initialVariables:
    lat: null
    lon: null
    radius: 2000
    numberOfStops: STOP_COUNT
    agency: config.preferredAgency
    date: moment().format("YYYYMMDD")
)
