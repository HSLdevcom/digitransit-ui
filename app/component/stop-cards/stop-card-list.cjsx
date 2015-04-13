React               = require 'react' 
NearestStopsStore   = require '../../store/nearest-stops-store'
NearestStopsActions = require '../../action/nearest-stops-action'
LocationStore       = require '../../store/location-store' 
StopCard            = require './stop-card'

class StopCardList extends React.Component
  constructor: -> 
    super
    @state = nearestStops: NearestStopsStore.nearestStops

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
  
  onLocationChange: ->
    coordinates = LocationStore.getLocationState()
    if (coordinates.lat != 0 || coordinates.lon != 0)
      NearestStopsActions.nearestStopsRequest(coordinates)

  render: ->
    stopCards = []
    stopCards.push <StopCard key={stop.id} name={stop.name} code={stop.code} dist={stop.dist} id={stop.id}/> for stop in @state.nearestStops.slice(0,10)
    <div className="row">
      {stopCards}
    </div>
    
module.exports = StopCardList