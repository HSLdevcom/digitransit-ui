React             = require 'react'
StopCardContainer = require './stop-card-container'
StopCardList      = require './stop-card-list'

STOP_COUNT = 10
DEPARTURES_COUNT = 5

class StopCardListContainer extends React.Component
  constructor: -> 
    super
    @state = numberOfStops: STOP_COUNT

  componentDidMount: => 
    @props.store.addChangeListener @onChange 

  componentWillUnmount: =>
    @props.store.removeChangeListener @onChange

  onChange: =>
    @forceUpdate()

  addStops: =>
    @setState
      numberOfStops: @state.numberOfStops + STOP_COUNT

  getStopCards: =>
    stopCards = []
    for stop in @props.store.getStops().slice(0,@state.numberOfStops)
      if stop.substring(0, 3) is 'HSL'
        stopCards.push <StopCardContainer key={stop} stop={stop} departures=DEPARTURES_COUNT /> 
    stopCards

  render: =>
    <StopCardList addStops=@addStops>
    	{@getStopCards()}
    </StopCardList>

module.exports = StopCardListContainer
