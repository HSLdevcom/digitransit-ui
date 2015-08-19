React              = require 'react'
DefaultNavigation  = require '../component/navigation/default-navigation'
Map                = require '../component/map/map'
DepartureListContainer = require '../component/stop-cards/departure-list-container'
StopCardHeader     = require '../component/stop-cards/stop-card-header'
StopDeparturesAction = require '../action/stop-departures-action'
isBrowser          = window?
CircleMarker       = if isBrowser then require 'react-leaflet/lib/CircleMarker' else null
FavouriteStopsAction = require '../action/favourite-stops-action'
Link               = require('react-router/lib/Link').Link
Icon               = require '../component/icon/icon'

class Page extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    router: React.PropTypes.object.isRequired

  @loadAction: StopDeparturesAction.stopPageDataRequest


  componentDidMount: ->
    @context.getStore('StopInformationStore').addChangeListener @onChange
    @context.getStore('FavouriteStopsStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('StopInformationStore').removeChangeListener @onChange
    @context.getStore('FavouriteStopsStore').removeChangeListener @onChange

  onChange: (id) =>
    if !id or id == @props.params.stopId
      @forceUpdate()

  toggleFullscreenMap: =>
    @context.router.transitionTo "#{process.env.ROOT_PATH}pysakit/#{@props.params.stopId}/kartta"

  render: ->
    stop = @context.getStore('StopInformationStore').getStop(@props.params.stopId)
    unless stop
      return <DefaultNavigation className="fullscreen"/>
    favourite = @context.getStore('FavouriteStopsStore').isFavourite(stop.id)
    addFavouriteStop = (e) =>
      e.stopPropagation()
      @context.executeAction FavouriteStopsAction.addFavouriteStop, stop.id

    <DefaultNavigation className="fullscreen">
      <Map lat={stop.lat+0.0005} lon={stop.lon} zoom={16} showStops=true hilightedStops=[stop.id]>
        <div className="map-click-prevent-overlay" onTouchTap={@toggleFullscreenMap}></div>
        <StopCardHeader stop={stop} favourite={favourite} addFavouriteStop={addFavouriteStop} dist={0} className="stop-page" infoIcon={true}/>
        <Link to="#{process.env.ROOT_PATH}pysakit/#{@props.params.stopId}/kartta"><div className="fullscreen-toggle"><Icon img={'icon-icon_maximize'} className="cursor-pointer" /></div></Link>
      </Map>
      <DepartureListContainer showMissingRoutes={false} stop={@props.params.stopId} className="stop-page below-map" routeLinks={true} infiniteScroll={true}/>
    </DefaultNavigation>

module.exports = Page
