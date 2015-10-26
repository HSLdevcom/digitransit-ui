React              = require 'react'
Relay              = require 'react-relay'
queries            = require '../queries'
DefaultNavigation  = require '../component/navigation/default-navigation'
Icon               = require '../component/icon/icon'
Map                = require '../component/map/map'
Link               = require 'react-router/lib/Link'
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
      <StopCardHeader stop={@props.stop} favourite={favourite} addFavouriteStop={addFavouriteStop} headingStyle="h3" className="stop-page" infoIcon={true}/>
      <Map lat={@props.stop.lat}
           lon={@props.stop.lon}
           zoom={16}
           className="fullscreen"
           headingStyle="h3"
            showStops=true
           hilightedStops=[@props.params.stopId]>
        <Link to="#{process.env.ROOT_PATH}pysakit/#{@props.params.stopId}">
          <div className="smallscreen-toggle">
            <Icon img={'icon-icon_minimize'} className="cursor-pointer" />
          </div>
        </Link>
      </Map>
    </DefaultNavigation>

module.exports = Relay.createContainer(Page, fragments: queries.StopMapPageFragments)
