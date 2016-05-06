React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
DepartureListContainer = require '../departure/departure-list-container'
StopCard              = require './stop-card'
FavouriteStopsActions = require '../../action/favourite-stops-action'
moment                = require 'moment'
connectToStores = require 'fluxible-addons-react/connectToStores'

class StopCardContainer extends React.Component
  @contextTypes:
    executeAction: React.PropTypes.func.isRequired

  addFavouriteStop: (e) =>
    e.preventDefault()
    @context.executeAction FavouriteStopsActions.addFavouriteStop, @props.stop.gtfsId

  render: =>
    <StopCard
      className={@props.className}
      stop={@props.stop}
      distance={@props.distance}
      favourite={@props.favourite}
      addFavouriteStop={@addFavouriteStop}>
      <DepartureListContainer
        rowClasses="no-padding no-margin"
        stoptimes={@props.stop.stoptimes}
        limit={@props.departures}/>
    </StopCard>

StopCardContainerWithFavourite = connectToStores StopCardContainer, ['FavouriteStopsStore'], (context, props) ->
  favourite: context.getStore('FavouriteStopsStore').isFavourite(props.stop.gtfsId)

module.exports = Relay.createContainer StopCardContainerWithFavourite,
  fragments: queries.StopCardContainerFragments
  initialVariables:
    date: null
