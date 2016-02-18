React   = require 'react'
Relay   = require 'react-relay'
queries = require '../../queries'
FavouriteRouteListContainer = require './favourite-route-list-container'
FavouriteLocationsContainer = require './favourite-locations-container'
NextDeparturesListHeader    = require '../departure/next-departures-list-header'
NoFavouritesPanel           = require './no-favourites-panel'

class FavouritesPanel extends React.Component

  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  componentDidMount: ->
    @context.getStore('FavouriteRoutesStore').addChangeListener @onChange
    @context.getStore('FavouriteStopsStore').addChangeListener @onChange
    @context.getStore('TimeStore').addChangeListener @onTimeChange

  componentWillUnmount: ->
    @context.getStore('FavouriteRoutesStore').removeChangeListener @onChange
    @context.getStore('FavouriteStopsStore').removeChangeListener @onChange
    @context.getStore('TimeStore').removeChangeListener @onTimeChange

  onChange: (id) =>
    @forceUpdate()

  onTimeChange: (e) =>
    if e.currentTime
      @forceUpdate()

  render: ->
    routes = @context.getStore('FavouriteRoutesStore').getRoutes()
    if routes.length > 0
      favouriteRoutes = <Relay.RootContainer
        Component={FavouriteRouteListContainer}
        forceFetch={true}
        route={new queries.FavouriteRouteListContainerRoute(
          ids: routes
        )}
        renderLoading={=> <div className="spinner-loader"/>}
      />
    else
      favouriteRoutes = <NoFavouritesPanel/>

    <div className="frontpage-panel">
      <div className="row favourite-locations-container">
        <FavouriteLocationsContainer/>
      </div>
      <NextDeparturesListHeader />
      <div className="scrollable momentum-scroll scroll-extra-padding-bottom">
        {favouriteRoutes}
      </div>
    </div>

module.exports = FavouritesPanel
