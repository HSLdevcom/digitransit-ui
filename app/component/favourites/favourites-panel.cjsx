React   = require 'react'
Relay   = require 'react-relay'
queries = require '../../queries'
FavouriteRouteListContainer = require('./FavouriteRouteListContainer').default
FavouriteLocationsContainer = require './favourite-locations-container'
NextDeparturesListHeader    = require '../departure/next-departures-list-header'
NoFavouritesPanel           = require './no-favourites-panel'
connectToStores             = require 'fluxible-addons-react/connectToStores'

FavouriteRoutes = ({routes}) ->
  if routes.length > 0
    <Relay.RootContainer
      Component={FavouriteRouteListContainer}
      forceFetch={true}
      route={new queries.FavouriteRouteListContainerRoute(
        ids: routes
      )}
      renderLoading={=> <div className="spinner-loader"/>}
    />
  else
    <NoFavouritesPanel/>

FavouritesPanel = ({routes}) ->
  <div className="frontpage-panel">
    <div className="row favourite-locations-container">
      <FavouriteLocationsContainer/>
    </div>
    <NextDeparturesListHeader />
    <div className="scrollable momentum-scroll scroll-extra-padding-bottom">
      <FavouriteRoutes routes={routes}/>
    </div>
  </div>

# TODO: Make sure these keep updating from the time store, possibly lift depending to time store here
module.exports = connectToStores FavouritesPanel, ['FavouriteRoutesStore'], (context, props) ->
  routes: context.getStore('FavouriteRoutesStore').getRoutes()
