React                 = require 'react'
Departure             = require './departure'
StopDeparturesStore   = require '../../store/stop-departures-store'
StopDeparturesActions = require '../../action/stop-departures-action'
Icon                  = require '../icon/icon.cjsx'

class StopCard extends React.Component
  @contextTypes:
    router: React.PropTypes.func

  constructor: -> 
    super
    @state = departures: StopDeparturesStore.departures[@props.id]

  componentDidMount: -> 
    StopDeparturesStore.addChangeListener @onChange
    if !@state.departures
      StopDeparturesActions.stopDeparturesRequest @props.id

  componentWillUnmount: ->
    StopDeparturesStore.removeChangeListener @onChange

  onChange: =>
    @setState 
      departures: StopDeparturesStore.departures[@props.id]
  
  render: ->
    router = this.context.router
    description = ""
    if @props.description
      description += @props.description + " // "
    if @props.code
      description += @props.code + " // "
    if @props.dist
      description += @props.dist + " m"

    if !@state.departures
      return false

    departures = []

    for departure in @state.departures.slice(0,10)
      departures.push <Departure 
          key={departure.pattern.id + departure.time.serviceDay + departure.time.realtimeDeparture}
          time={departure.time}
          mode={departure.pattern.mode.toLowerCase()}
          routeShortName={departure.pattern.shortName}
          destination={departure.pattern.direction} /> 

    <div className="small-12 medium-6 large-4 columns">
      <div className="stop-card cursor-pointer" onClick={() => router.transitionTo('/pysakit/' + @props.id)}>
        <Icon className="favourite" img="icon-icon_star"/>
        <h3>{@props.name} ›</h3>
        <p className="location">{description}</p>
        {departures}
      </div>
    </div>

module.exports = StopCard