React                 = require 'react'
Departure             = require './departure'
StopDeparturesStore   = require '../../store/stop-departures-store'
StopDeparturesActions = require '../../action/stop-departures-action'
FavouriteStopsStore   = require '../../store/favourite-stops-store'
FavouriteStopsActions = require '../../action/favourite-stops-action'
Icon                  = require '../icon/icon.cjsx'

class StopCard extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    router: React.PropTypes.func

  constructor: -> 
    super
    @state = departures: @context.getStore(StopDeparturesStore).departures[@props.id]

  componentDidMount: -> 
    @context.getStore(StopDeparturesStore).addChangeListener @onChange
    if !@state.departures
      @context.executeAction StopDeparturesActions.stopDeparturesRequest, @props.id

  componentWillUnmount: ->
    @context.getStore(StopDeparturesStore).removeChangeListener @onChange

  componentDidUpdate: ->
    if @state.departures && @state.departures.length != 0
      @props.reloadMasonry()

  onChange: =>
    @setState 
      departures: @context.getStore(StopDeparturesStore).departures[@props.id]
  
  addFavouriteStop: (id) =>
    @context.executeAction FavouriteStopsActions.addFavouriteStop, id

  render: ->
    router = this.context.router
    description = ""
    if @props.description
      description += @props.description + " // "
    if @props.code
      description += @props.code + " // "
    if @props.dist
      description += @props.dist + " m"

    if !@state.departures || @state.departures.length == 0
      return false

    departures = []

    for departure in @state.departures.slice(0,5)
      departures.push <Departure 
          key={departure.pattern.id + departure.time.serviceDay + departure.time.realtimeDeparture}
          time={departure.time}
          mode={departure.pattern.mode.toLowerCase()}
          routeShortName={departure.pattern.shortName}
          destination={departure.pattern.direction} /> 

    <div className="small-12 medium-6 large-4 columns">
      <div className="stop-card cursor-pointer">  
        <span className="cursor-pointer" onClick={() => this.addFavouriteStop(@props.id)}>
          <Icon className="favourite" img="icon-icon_star"/>
        </span>
        <h3>{@props.name} ›</h3>
        <p className="location" onClick={() => router.transitionTo('/pysakit/' + @props.id)}>{description}</p>
        {departures}
      </div>
    </div>

module.exports = StopCard