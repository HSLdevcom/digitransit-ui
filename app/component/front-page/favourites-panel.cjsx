React             = require 'react'
NoFavouritesPanel = require './no-favourites-panel'

class FavouritesPanel extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  render: ->
    FavouriteRoutesStore = @context.getStore 'FavouriteRoutesStore'
    routes = FavouriteRoutesStore.getRoutes()
    if routes.length==0
      <NoFavouritesPanel/> if routes.length==0
    else
      <div className="favourites-panel text-center">
        <p>
          Favourites panel {routes}
        </p>
      </div>

module.exports = FavouritesPanel
