React                 = require 'react'
DepartureListContainer = require './departure-list-container'
StopCard              = require './stop-card'
FavouriteStopsActions = require '../../action/favourite-stops-action'

class StopCardContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  componentDidMount: ->
    @context.getStore('FavouriteStopsStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('FavouriteStopsStore').removeChangeListener @onChange

  onChange: (id) =>
    if !id or id == @props.stop.stop.gtfsId
      @forceUpdate()

  addFavouriteStop: (e) =>
    e.stopPropagation()
    @context.executeAction FavouriteStopsActions.addFavouriteStop, @props.stop.stop.gtfsId

  render: =>
    <StopCard
      key={@props.stop.stop.gtfsId}
      stop={@props.stop.stop}
      dist={@props.stop.distance}
      favourite={@context.getStore('FavouriteStopsStore').isFavourite(@props.stop.stop.gtfsId)}
      addFavouriteStop={@addFavouriteStop}>
      <DepartureListContainer showMissingRoutes={false} stop={@props.stop.stop} departures={@props.departures}/>
    </StopCard>

module.exports = StopCardContainer
