React              = require 'react'
Relay              = require 'react-relay'
queries            = require '../queries'
DefaultNavigation  = require '../component/navigation/default-navigation'
Icon               = require '../component/icon/icon'
Map                = require '../component/map/map'
Link               = require('react-router/lib/Link').Link
StopCardHeader     = require '../component/stop-cards/stop-card-header'
FavouriteStopsAction = require '../action/favourite-stops-action'

class Page extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  render: ->
    favourite = @context.getStore('FavouriteStopsStore').isFavourite(@props.params.stopId)
    addFavouriteStop = (e) =>
      e.stopPropagation()
      @context.executeAction FavouriteStopsAction.addFavouriteStop, @props.params.stopId

    <DefaultNavigation className="fullscreen">
      <Map lat={@props.stop.lat+0.0005}
           lon={@props.stop.lon}
           zoom={16}
           className="fullscreen"
           showStops=true
           hilightedStops=[@props.params.stopId]
           stopsInRectangle={@props.stopsInRectangle}>
        <StopCardHeader stop={@props.stop} favourite={favourite} addFavouriteStop={addFavouriteStop} className="stop-page" infoIcon={true}/>
        <Link to="#{process.env.ROOT_PATH}pysakit/#{@props.params.stopId}">
          <div className="fullscreen-toggle">
            <Icon img={'icon-icon_minimize'} className="cursor-pointer" />
          </div>
        </Link>
      </Map>
    </DefaultNavigation>

module.exports = Relay.createContainer(Page, fragments: queries.StopMapPageFragments)
