React              = require 'react'
DefaultNavigation  = require '../component/navigation/default-navigation'
Icon               = require '../component/icon/icon'
Map                = require '../component/map/map'
Link               = require 'react-router/lib/components/Link'
StopCardHeader     = require '../component/stop-cards/stop-card-header'
StopDeparturesAction = require '../action/stop-departures-action'
FavouriteStopsAction = require '../action/favourite-stops-action'
isBrowser          = window?
CircleMarker       = if isBrowser then require 'react-leaflet/lib/CircleMarker' else null


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
    leafletObjs.push <CircleMarker key="marker_outline" center={lat: stop.lat, lng: stop.lon} radius=16 weight=1 color="#333" opacity=0.4 fillColor="#fff" fillOpacity=1 />
    leafletObjs.push  <CircleMarker key="marker" center={lat: stop.lat, lng: stop.lon} radius=9 weight=8 color={color} opacity=1 fillColor="#fff" fillOpacity=1 />

    <DefaultNavigation className="fullscreen">
      <Map lat={stop.lat+0.0005} lon={stop.lon} zoom={16} leafletObjs={leafletObjs} className="fullscreen">
        <StopCardHeader stop={stop} favourite={favourite} addFavouriteStop={addFavouriteStop} dist={0} className="stop-page" infoIcon={true}/>
        <Link to="stop" params={{stopId: @props.params.stopId}}><div className="fullscreen-toggle"><Icon img={'icon-icon_minimize'} className="cursor-pointer" /></div></Link>
      </Map>
    </DefaultNavigation>

module.exports = Page
