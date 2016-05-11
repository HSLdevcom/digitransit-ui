React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
DepartureListContainer = require '../departure/departure-list-container'
StopCard              = require './stop-card'
FavouriteStopsActions = require '../../action/favourite-stops-action'
connectToStores = require 'fluxible-addons-react/connectToStores'

StopCardContainer = connectToStores StopCard, ['FavouriteStopsStore'], (context, props) ->
  favourite: context.getStore('FavouriteStopsStore').isFavourite(props.stop.gtfsId)
  addFavouriteStop: (e) ->
    e.preventDefault()
    context.executeAction FavouriteStopsActions.addFavouriteStop, props.stop.gtfsId
  children:
    <DepartureListContainer
      rowClasses="no-padding no-margin"
      stoptimes={props.stop.stoptimes}
      limit={props.departures}/>

StopCardContainer.contextTypes =
  executeAction: React.PropTypes.func.isRequired
  getStore: React.PropTypes.func.isRequired

module.exports = Relay.createContainer StopCardContainer,
  fragments: queries.StopCardContainerFragments
  initialVariables:
    date: null
