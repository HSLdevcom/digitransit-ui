React                           = require 'react'
Relay                           = require 'react-relay'
NoFavouritesPanel               = require './no-favourites-panel'
FavouriteStopCardListContainer  = require '../stop-cards/favourite-stop-card-list-container'
queries                         = require '../../queries'

class FavouritesPanel extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  getNearStopContainer: (ids) =>
    <Relay.RootContainer
      Component={FavouriteStopCardListContainer}
      route={new queries.FavouriteStopListContainerRoute({
        ids: ids
        })}
      renderLoading={-> <div className="spinner-loader"/>}
      }
    />
  render: ->
    FavouriteStopsStore = @context.getStore 'FavouriteStopsStore'
    stops = FavouriteStopsStore.getStops()

    if stops.length==0
      <NoFavouritesPanel/>
    else
      @getNearStopContainer(stops)

module.exports = FavouritesPanel
