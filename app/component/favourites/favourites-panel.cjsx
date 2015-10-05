React                           = require 'react'
Relay                           = require 'react-relay'
NoFavouritesPanel               = require './no-favourites-panel'
FavouriteStopCardListContainer  = require './favourite-stop-card-list-container'
FavouriteRoutesContainer     = require './favourite-routes-container'
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

  getFavouriteRouteContainer: (ids) =>
    <Relay.RootContainer
      key="fav-routes"
      Component={FavouriteRoutesContainer}
      route={new queries.FavouriteRouteRowRoute({
        ids: ids
        })}
      renderLoading={-> <div className="spinner-loader"/>}
      }
    />

  componentDidMount: ->
    @context.getStore('FavouriteRoutesStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('FavouriteRoutesStore').removeChangeListener @onChange

  onChange: (id) =>
    @forceUpdate()

  getFavourites: (stops, routes) =>
    c=[]
    c.push @getFavouriteStopContainer(stops)
    c.push @getFavouriteRouteContainer(routes)
    c

  render: ->
    FavouriteStopsStore = @context.getStore 'FavouriteStopsStore'
    stops = FavouriteStopsStore.getStops()

    FavouriteRoutesStore = @context.getStore 'FavouriteRoutesStore'
    routes = FavouriteRoutesStore.getRoutes()

    if stops.concat(routes).length==0
      <NoFavouritesPanel/>
    else
      <div>
      {@getFavourites(stops, routes)}
      </div>

module.exports = FavouritesPanel
