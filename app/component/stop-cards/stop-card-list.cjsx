React               = require 'react' 
NearestStopsActions = require '../../action/nearest-stops-action'
StopCard            = require './stop-card'
MasonryComponent    = require './MasonryComponent'
LocationStore       = require '../../store/location-store.coffee'

STOP_COUNT = 10

class StopCardList extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  @propTypes:
    store: React.PropTypes.any

  constructor: -> 
    super
    
  componentWillMount: =>
    @onChange()

  componentDidMount: => 
    @props.store.addChangeListener @onChange 
    @context.getStore(LocationStore).addChangeListener @onLocationChange
    @onLocationChange()

  componentWillUnmount: =>
    @props.store.removeChangeListener @onChange
    @context.getStore(LocationStore).removeChangeListener @onLocationChange

  onChange: =>
    @setState 
      stops: @props.store.getStops()
      numberOfStops: STOP_COUNT
  
  onLocationChange: =>
    coordinates = @context.getStore(LocationStore).getLocationState()
    if (coordinates.lat != 0 || coordinates.lon != 0)
      @context.executeAction NearestStopsActions.nearestStopsRequest, coordinates

  addStops: =>
    @setState
      numberOfStops: @state.numberOfStops + STOP_COUNT

  reloadMasonry: =>
    @refs['stop-cards-masonry'].performLayout()

  render: =>
    stopCards = []
    for stop in @state.stops.slice(0,@state.numberOfStops)
      stopCards.push <StopCard key={stop.id} name={stop.name} code={stop.code} dist={stop.dist} id={stop.id} reloadMasonry={@reloadMasonry}/> 
    <div className="stop-cards">
      <div className="row">
        <MasonryComponent ref="stop-cards-masonry">
          {stopCards}
        </MasonryComponent>
      </div>
      <div className="row">
        <div className="small-10 small-offset-1 medium-6 medium-offset-3 columns">
          <button className="show-more" onClick=@addStops>
            Näytä Lisää
          </button>
        </div>
      </div>
    </div>
    
module.exports = StopCardList