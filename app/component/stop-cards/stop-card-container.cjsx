React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
DepartureListContainer = require('../departure/DepartureListContainer').default
StopCard              = require './stop-card'
{addFavouriteStop} = require('../../action/FavouriteActions')
connectToStores = require 'fluxible-addons-react/connectToStores'

StopCardContainer = connectToStores StopCard, ['FavouriteStopsStore'], (context, props) ->
  favourite: context.getStore('FavouriteStopsStore').isFavourite(props.stop.gtfsId)
  addFavouriteStop: (e) ->
    e.preventDefault()
    context.executeAction addFavouriteStop, props.stop.gtfsId
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
