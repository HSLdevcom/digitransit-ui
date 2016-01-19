React             = require 'react'
Relay             = require 'react-relay'
queries           = require '../../queries'
StopCardContainer = require '../stop-cards/stop-card-container'
StopCardList      = require '../stop-cards/stop-card-list'

DEPARTURES_COUNT = 5

class FavouriteStopCardListContainer extends React.Component

  @propTypes:
    stops: React.PropTypes.any.isRequired

  getStopCards: =>
    stopCards = []
    for stop in @props.stops
      stopCards.push <StopCardContainer key={stop.gtfsId}
                                        stop={stop}
                                        departures=DEPARTURES_COUNT
                                        date={@props.relay.variables.date}
                                        className="padding-small"/>
    stopCards

  render: =>
    <StopCardList classname="row" addStops=false hideShowMoreButton=true>
      {@getStopCards()}
    </StopCardList>



module.exports = Relay.createContainer(FavouriteStopCardListContainer,
  fragments: queries.FavouriteStopListContainerFragments
  initialVariables:
    ids: null
    date: null
)
