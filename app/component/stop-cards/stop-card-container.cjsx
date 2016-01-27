React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
DepartureListContainer = require '../departure/departure-list-container'
StopCard              = require './stop-card'
FavouriteStopsActions = require '../../action/favourite-stops-action'
moment                = require 'moment'

class StopCardContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  componentDidMount: ->
    @context.getStore('FavouriteStopsStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('FavouriteStopsStore').removeChangeListener @onChange

  onChange: (id) =>
    if !id or id == @props.stop.gtfsId
      @forceUpdate()

  addFavouriteStop: (e) =>
    e.preventDefault()
    @context.executeAction FavouriteStopsActions.addFavouriteStop, @props.stop.gtfsId

  render: =>
    <StopCard
      className={@props.className}
      stop={@props.stop}
      distance={@props.distance}
      favourite={@context.getStore('FavouriteStopsStore').isFavourite(@props.stop.gtfsId)}
      addFavouriteStop={@addFavouriteStop}>
      <DepartureListContainer
        rowClasses="no-padding no-margin"
        stoptimes={@props.stop.stoptimes}
        limit={@props.departures}/>
    </StopCard>


module.exports = Relay.createContainer StopCardContainer,
  fragments: queries.StopCardContainerFragments
  initialVariables:
    date: null
