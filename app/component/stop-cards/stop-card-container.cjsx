React                 = require 'react'
Departure             = require './departure'
StopCard              = require './stop-card'
StopDeparturesActions = require '../../action/stop-departures-action'


class StopCardContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  componentDidMount: -> 
    @context.getStore('StopDeparturesStore').addChangeListener @onChange
    @context.getStore('StopInformationStore').addChangeListener @onChange
    @context.getStore('FavouriteStopsStore').addChangeListener @onChange
    @context.getStore('NearestStopsStore').addChangeListener @onChange
    if @context.getStore('StopDeparturesStore').getDepartures(@props.stop) == undefined
      # This should not be run if the departures are already being fetched
      @context.executeAction StopDeparturesActions.stopDeparturesRequest, @props.stop
    if @context.getStore('StopInformationStore').getStop(@props.stop) == undefined
      @context.executeAction StopDeparturesActions.stopInformationRequest, @props.stop


  componentWillUnmount: ->
    @context.getStore('StopDeparturesStore').removeChangeListener @onChange
    @context.getStore('StopInformationStore').removeChangeListener @onChange
    @context.getStore('FavouriteStopsStore').removeChangeListener @onChange
    @context.getStore('NearestStopsStore').removeChangeListener @onChange

  componentDidUpdate: ->
    if @context.getStore('StopDeparturesStore').getDepartures(@props.stop)
      @props.reloadMasonry()

  onChange: (id) =>
    if !id or id == @props.stop
      @forceUpdate()
  
  getDepartures: =>
    departureObjs = []
    departures = @context.getStore('StopDeparturesStore').getDepartures(@props.stop)
    if !departures
      return []
    for departure in departures.slice(0,@props.departures)
      id = departure.pattern.id + departure.time.servideDay + departure.time.scheduledDeparture
      departureObjs.push <Departure key={id} departure={departure} />
    departureObjs

  render: =>
    <StopCard key={@props.stop} stop={@context.getStore('StopInformationStore').getStop(@props.stop)} dist={@context.getStore('NearestStopsStore').getDistance(@props.stop)}>
      {@getDepartures()}
    </StopCard>

module.exports = StopCardContainer