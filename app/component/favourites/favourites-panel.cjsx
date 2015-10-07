React                           = require 'react'
Relay                           = require 'react-relay'
NoFavouritesPanel               = require './no-favourites-panel'
FavouriteStopCardListContainer  = require './favourite-stop-card-list-container'
FavouriteRouteListContainer     = require './favourite-route-list-container'
queries                         = require '../../queries'

class FavouritesPanel extends React.Component

  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  getFavouriteStopContainer: (ids) =>
    <Relay.RootContainer
      key="fav-tops"
      Component={FavouriteStopCardListContainer}
      route={new queries.FavouriteStopListContainerRoute({
        ids: ids
        })}
      renderLoading={-> <div className="spinner-loader"/>}
      }
    />

  getFavouriteRouteListContainer: (ids) =>
    <Relay.RootContainer
      key="fav-routes"
      Component={FavouriteRouteListContainer}
      route={new queries.FavouriteRouteRowRoute({
        ids: ids
        })}
      renderLoading={-> <div className="spinner-loader"/>}
      }
    />

  componentDidMount: ->
    @context.getStore('FavouriteRoutesStore').addChangeListener @onChange
    @context.getStore('FavouriteStopsStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('FavouriteRoutesStore').removeChangeListener @onChange
    @context.getStore('FavouriteStopsStore').removeChangeListener @onChange

  onChange: (id) =>
    @forceUpdate()

  render: ->
    FavouriteStopsStore = @context.getStore 'FavouriteStopsStore'
    FavouriteRoutesStore = @context.getStore 'FavouriteRoutesStore'

    if FavouriteStopsStore.getStops().concat(FavouriteRoutesStore.getRoutes()).length == 0
      <NoFavouritesPanel/>
    else
      <div>
        {@getFavouriteStopContainer FavouriteStopsStore.getStops()}
        {@getFavouriteRouteListContainer FavouriteRoutesStore.getRoutes()}
      </div>




module.exports = FavouritesPanel
