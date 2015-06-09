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
    favourite = @context.getStore('FavouriteStopsStore').isFavourite(stop.id)
    addFavouriteStop = (e) =>
      e.stopPropagation()
      @context.executeAction FavouriteStopsAction.addFavouriteStop, stop.id

    <DefaultNavigation className="fullscreen">
      <Map lat={stop.lat+0.0005} lon={stop.lon} zoom={16} className="fullscreen" showStops=true hilightedStops=[stop.id]>
        <StopCardHeader stop={stop} favourite={favourite} addFavouriteStop={addFavouriteStop} dist={0} className="stop-page" infoIcon={true}/>
        <Link to="stop" params={{stopId: @props.params.stopId}}><div className="fullscreen-toggle"><Icon img={'icon-icon_minimize'} className="cursor-pointer" /></div></Link>
      </Map>
    </DefaultNavigation>

module.exports = Page
