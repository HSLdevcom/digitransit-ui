React                 = require 'react'
Departure             = require './departure'
StopCard              = require './stop-card'
StopDeparturesActions = require '../../action/stop-departures-action'
uniq                  = require 'lodash/array/uniq'
difference            = require 'lodash/array/difference'

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
  
  getDepartures: (showMissingRoutes) =>
    departureObjs = []
    seenRoutes = []
    departures = @context.getStore('StopDeparturesStore').getDepartures(@props.stop)
    if !departures
      return false
    for departure in departures.slice(0,@props.departures)
      id = departure.pattern.id + departure.time.servideDay + departure.time.scheduledDeparture
      departureObjs.push <Departure key={id} departure={departure} />
      seenRoutes.push(departure.pattern.shortName)
    if showMissingRoutes
      missingRoutes = difference(uniq(departure.pattern.shortName for departure in departures), seenRoutes)
      missingRoutes.sort()
      if missingRoutes.length == 0
      else if missingRoutes.length == 1
        departureObjs.push <p key="missingRoutes" className="missing-routes">Lisäksi linja {missingRoutes[0]}</p>
      else if missingRoutes.length == 2
        departureObjs.push <p key="missingRoutes" className="missing-routes">Lisäksi linjat {missingRoutes[0]} ja {missingRoutes[0]}</p>  
      else
        departureObjs.push <p key="missingRoutes" className="missing-routes">Lisäksi linjat {missingRoutes.slice(0,-1).join ', '} ja {missingRoutes[missingRoutes.length-1]}</p>  
    departureObjs

  render: =>
    <StopCard
      key={@props.stop}
      stop={@context.getStore('StopInformationStore').getStop(@props.stop)}
      dist={@context.getStore('NearestStopsStore').getDistance(@props.stop)}
      favourite={@context.getStore('FavouriteStopsStore').isFavourite(@props.stop)}>
      {@getDepartures(true)}
    </StopCard>

module.exports = StopCardContainer