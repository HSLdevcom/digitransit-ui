React                           = require 'react'
Relay                           = require 'react-relay'
NoFavouritesPanel               = require './no-favourites-panel'
FavouriteStopCardListContainer  = require './favourite-stop-card-list-container'
FavouriteRouteListContainer     = require './favourite-route-list-container'
queries                         = require '../../queries'

class FavouritesPanel extends React.Component

  constructor: ->
    super
    @state =
      useSpinner: true

  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  getFavouriteStopContainer: (ids) =>
    <Relay.RootContainer
      key="fav-stops"
      Component={FavouriteStopCardListContainer}
      route={new queries.FavouriteStopListContainerRoute(
        ids: ids
        date: @context.getStore('TimeStore').getCurrentTime().format("YYYYMMDD")
      )}
      forceFetch={true}
      renderLoading={=> if(@state.useSpinner == true) then <div className="spinner-loader"/> else undefined}
      }
    />

  getFavouriteRouteListContainer: (ids) =>
    <Relay.RootContainer
      key="fav-routes"
      forceFetch={true}
      Component={FavouriteRouteListContainer}
      route={new queries.FavouriteRouteRowRoute(
        ids: ids
      )}
      renderLoading={=> if(@state.useSpinner == true) then <div className="spinner-loader"/> else undefined}
      }
    />

  shouldComponentUpdate: (nextProps, nextState) =>
    ## do not render on state change
    if nextState.useSpinner == false && @state.useSpinner == true
      return false
    true

  componentDidMount: ->
    @context.getStore('FavouriteRoutesStore').addChangeListener @onChange
    @context.getStore('FavouriteStopsStore').addChangeListener @onChange
    @context.getStore('TimeStore').addChangeListener @onTimeChange
    @setState({"useSpinner": false})

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
