React              = require 'react'
Relay              = require 'react-relay'
queries            = require '../queries'
IndexNavigation    = require '../component/navigation/index-navigation.cjsx'
Map                = require '../component/map/map.cjsx'
FrontPagePanel     = require '../component/front-page/front-page-panel.cjsx'
SearchTwoFieldsContainer = require '../component/search/search-two-fields-container'
Icon               = require '../component/icon/icon'
Link               = require 'react-router/lib/Link'
ToggleMapTracking   = require '../component/navigation/toggle-map-tracking'


class Page extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    history: React.PropTypes.object.isRequired

  toggleFullscreenMap: =>
    @context.history.pushState null, "/kartta"

  componentWillMount: =>
    @context.getStore('MapTrackStore').addChangeListener @onTrackStatusChange

  componentWillUnmount: =>
    @context.getStore('MapTrackStore').removeChangeListener @onTrackStatusChange

  onTrackStatusChange: =>
    @forceUpdate()

  render: ->
    <IndexNavigation className="front-page fullscreen">
      <Map className="fullscreen" showStops={true}>
        <SearchTwoFieldsContainer/>
        <ToggleMapTracking tracking={@context.getStore('MapTrackStore').getMapTrackState()}
                           onlineClassName="icon-mapMarker-toggle-positioning-online"
                           offlineClassName="icon-mapMarker-toggle-positioning-offline"/>
      </Map>
      <FrontPagePanel/>
    </IndexNavigation>

module.exports = Page
