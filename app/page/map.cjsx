React              = require 'react'
DefaultNavigation  = require '../component/navigation/default-navigation'
SearchWithLocation = require '../component/search/search-with-location.cjsx'
Icon               = require '../component/icon/icon'
Map                = require '../component/map/map'

class Page extends React.Component
  @contextTypes:
    router: React.PropTypes.func

  toggleFullscreenMap: =>
    @context.router.transitionTo("index")

  render: ->
    <DefaultNavigation className="fullscreen">
      <Map className="fullscreen" showStops=true>
        <SearchWithLocation/>
        <div className="fullscreen-toggle" onClick={@toggleFullscreenMap}><Icon img={'icon-icon_minimize'} className="cursor-pointer" /></div>
      </Map>
    </DefaultNavigation>

module.exports = Page