React              = require 'react'
DefaultNavigation  = require '../component/navigation/default-navigation'
Map                = require '../component/map/map'
DepartureListContainer = require '../component/stop-cards/departure-list-container'
StopCardHeader     = require '../component/stop-cards/stop-card-header'
StopDeparturesAction = require '../action/stop-departures-action'
isBrowser          = window?
CircleMarker       = if isBrowser then require 'react-leaflet/lib/CircleMarker' else null
FavouriteStopsAction = require '../action/favourite-stops-action'
Link               = require 'react-router/lib/components/Link'
Icon               = require '../component/icon/icon'

class Page extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  @loadAction: StopDeparturesAction.stopPageDataRequest

  render: ->
    stop = @context.getStore('StopInformationStore').getStop(@props.params.stopId)
    departures = @context.getStore('StopDeparturesStore').getDepartures(@props.params.stopId)
    favourite = @context.getStore('FavouriteStopsStore').isFavourite(stop.id)
    addFavouriteStop = (e) =>
      e.stopPropagation()
      @context.executeAction FavouriteStopsAction.addFavouriteStop, stop.id
    color = "#007AC9" # TODO: Should come from stop
    leafletObjs = []
    leafletObjs.push <CircleMarker key="marker_outline" center={lat: stop.lat, lng: stop.lon} radius=8 weight=1 color="#333" opacity=0.4 fillColor="#fff" fillOpacity=1 />
    leafletObjs.push  <CircleMarker key="marker" center={lat: stop.lat, lng: stop.lon} radius=4.5 weight=4 color={color} opacity=1 fillColor="#fff" fillOpacity=1 />

    <DefaultNavigation>
      <Map center={lat:stop.lat+0.0005, lng:stop.lon} zoom={16} leafletObjs={leafletObjs}>
        <StopCardHeader stop={stop} favourite={favourite} addFavouriteStop={addFavouriteStop} dist={0} className="stop-page"/>
        <Link to="stopMap" params={{stopId: @props.params.stopId}}><div className="fullscreen-toggle"><Icon img={'icon-icon_maximize'} className="cursor-pointer" /></div></Link>
      </Map>
      <DepartureListContainer showMissingRoutes={false} stop={@props.params.stopId} className="stop-page" routeLinks={true}/>
    </DefaultNavigation>

module.exports = Page