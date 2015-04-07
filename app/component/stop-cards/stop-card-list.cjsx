React               = require 'react' 
NearestStopsStore   = require '../../store/nearest-stops-store.coffee'
NearestStopsActions = require '../../action/nearest-stops-action'
LocationStore       = require '../../store/location-store.coffee' 
StopCard            = require './stop-card'
div                 = React.createFactory 'div'

class StopCardList extends React.Component
  constructor: -> 
    super
    @state = nearestStops: NearestStopsStore.nearestStops

  componentDidMount: -> 
    NearestStopsStore.addChangeListener @onChange 
    LocationStore.addChangeListener @onLocationChange

  componentWillUnmount: ->
    NearestStopsStore.removeChangeListener @onChange
    LocationStore.removeChangeListener @onLocationChange

  onChange: =>
    @setState 
      nearestStops: NearestStopsStore.nearestStops
  
  onLocationChange: ->
    coordinates = LocationStore.getLocationState()
    if (coordinates.lat != 0 || coordinates.lon != 0)
      NearestStopsActions.nearestStopsRequest(coordinates)

  render: ->
    stopCards = []
    stopCards.push <StopCard key={stop.id} name={stop.name}/> for stop in @state.nearestStops
    <div className="row">
      {stopCards}
    </div>
    
module.exports = StopCardList