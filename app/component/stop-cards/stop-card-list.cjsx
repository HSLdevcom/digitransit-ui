React               = require 'react' 
NearestStopsStore   = require '../../store/nearest-stops-store'
NearestStopsActions = require '../../action/nearest-stops-action'
LocationStore       = require '../../store/location-store' 
StopCard            = require './stop-card'

class StopCardList extends React.Component
  constructor: -> 
    super
    @state = 
      nearestStops: NearestStopsStore.nearestStops
      numberOfStops: 10

  componentDidMount: -> 
    NearestStopsStore.addChangeListener @onChange 
    LocationStore.addChangeListener @onLocationChange
    @onLocationChange()

  componentWillUnmount: ->
    NearestStopsStore.removeChangeListener @onChange
    LocationStore.removeChangeListener @onLocationChange

  onChange: =>
    @setState 
      nearestStops: NearestStopsStore.nearestStops
      numberOfStops: 10
  
  onLocationChange: ->
    coordinates = LocationStore.getLocationState()
    if (coordinates.lat != 0 || coordinates.lon != 0)
      NearestStopsActions.nearestStopsRequest(coordinates)

  addStops: =>
    @setState
      numberOfStops: @state.numberOfStops+10

  render: ->
    stopCards = []
    for stop in @state.nearestStops.slice(0,@state.numberOfStops)
      stopCards.push <StopCard key={stop.id} name={stop.name} code={stop.code} dist={stop.dist} id={stop.id}/> 
    <div className="stop-cards row">
      <div className="row">
        {stopCards}
      </div>
      <h3 className="show-more" onClick=@addStops>
        Näytä Lisää
      </h3>
    </div>
    
module.exports = StopCardList