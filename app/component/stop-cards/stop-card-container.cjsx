React                 = require 'react'
DepartureListContainer = require './departure-list-container'
StopCard              = require './stop-card'
StopDeparturesActions = require '../../action/stop-departures-action'
FavouriteStopsActions = require '../../action/favourite-stops-action'

class StopCardContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  componentDidMount: ->
    @context.getStore('StopInformationStore').addChangeListener @onChange
    @context.getStore('FavouriteStopsStore').addChangeListener @onChange
    @context.getStore('NearestStopsStore').addChangeListener @onChange
    @context.getStore('StopDeparturesStore').addChangeListener @componentDidUpdate
    if !@context.getStore('StopDeparturesStore').getInitialStopsFetchInProgress()
      if @context.getStore('StopInformationStore').getStop(@props.stop) == undefined
        @context.executeAction StopDeparturesActions.stopInformationRequest, @props.stop


  componentWillUnmount: ->
    @context.getStore('StopInformationStore').removeChangeListener @onChange
    @context.getStore('FavouriteStopsStore').removeChangeListener @onChange
    @context.getStore('NearestStopsStore').removeChangeListener @onChange
    @context.getStore('StopDeparturesStore').removeChangeListener @componentDidUpdate

  componentDidUpdate: =>
    if !@context.getStore('StopDeparturesStore').getInitialStopsFetchInProgress()
      if @props.reloadMasonry?
        @props.reloadMasonry()

  onChange: (id) =>
    if !id or id == @props.stop
      @forceUpdate()

  addFavouriteStop: (e) =>
    e.stopPropagation()
    @context.executeAction FavouriteStopsActions.addFavouriteStop, @props.stop.id

  render: =>
    <StopCard
      key={@props.stop}
      stop={@context.getStore('StopInformationStore').getStop(@props.stop)}
      dist={@context.getStore('NearestStopsStore').getDistance(@props.stop)}
      favourite={@context.getStore('FavouriteStopsStore').isFavourite(@props.stop)}
      addFavouriteStop={@addFavouriteStop}>
      <DepartureListContainer showMissingRoutes={true} stop={@props.stop} departures={@props.departures}/>
    </StopCard>

module.exports = StopCardContainer
