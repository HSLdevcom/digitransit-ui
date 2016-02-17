React   = require 'react'
Relay   = require 'react-relay'
queries = require '../../queries'
FavouriteRouteListContainer = require './favourite-route-list-container'
FavouriteLocationsContainer = require './favourite-locations-container'

class FavouritesPanel extends React.Component

  constructor: ->
    super

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
      favouriteRoutes = <div>TODO NO FAVOURITES</div>

    <div>
      <div className="row favourite-locations-container">
        <FavouriteLocationsContainer/>
      </div>
      <div className="row">
        {favouriteRoutes}
      </div>
    </div>

module.exports = FavouritesPanel
