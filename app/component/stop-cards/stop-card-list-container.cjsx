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

  constructor: ->
    super
    @state = numberOfStops: STOP_COUNT

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
    if @props.stops.stopsByRadius.length < (@state.numberOfStops + STOP_COUNT)
      @props.relay.setVariables
        radius: @props.relay.variables.radius + 500
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
    lat: 0.1
    lon: 0.1
    radius: 200.1
    agency: config.preferredAgency
)
