React              = require 'react'
IndexNavigation    = require '../component/navigation/index-navigation.cjsx'
Map                = require '../component/map/map.cjsx'
StopTabs           = require '../component/stop-cards/stop-tabs.cjsx'
SearchWithLocation = require '../component/search/search-with-location.cjsx'
Icon               = require '../component/icon/icon'
LocateActions      = require '../action/locate-actions.coffee'
Link               = require 'react-router/lib/components/Link'


class Page extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    router: React.PropTypes.func

  componentDidMount: ->
    if @context.getStore('LocationStore').getLocationState().status == 'no-location'
      @context.executeAction LocateActions.findLocation

  toggleFullscreenMap: =>
    @context.router.transitionTo("map")

  # Notice that we won't use onTouchTap here. That causes currently this problem:
  # https://github.com/facebook/react/issues/2061
  render: ->
    <IndexNavigation>
      <Map showStops=true>
        <div style={{position:'absolute', height:'100%', width:'100%'}} onClick={@toggleFullscreenMap}></div>
        <SearchWithLocation/>
        <Link to="map"><div className="fullscreen-toggle"><Icon img={'icon-icon_maximize'} className="cursor-pointer" /></div></Link>
      </Map>
      <StopTabs/>
    </IndexNavigation>

module.exports = Page
