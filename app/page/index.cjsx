React              = require 'react'
Relay              = require 'react-relay'
queries            = require '../queries'
IndexNavigation    = require '../component/navigation/index-navigation.cjsx'
Map                = require '../component/map/map.cjsx'
FrontPagePanel     = require '../component/front-page/front-page-panel.cjsx'
SearchTwoFields    = require '../component/search/search-two-fields.cjsx'
Icon               = require '../component/icon/icon'
LocateActions      = require '../action/locate-actions.coffee'
Link               = require 'react-router/lib/Link'


class Page extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    history: React.PropTypes.object.isRequired

  componentDidMount: ->
    if @context.getStore('LocationStore').getLocationState().status == 'no-location'
      @context.executeAction LocateActions.findLocation

  toggleFullscreenMap: =>
    @context.history.pushState null, "#{process.env.ROOT_PATH}kartta"

  render: ->
    <IndexNavigation className="front-page fullscreen">
      <Map className="fullscreen" showStops={true}>
        <SearchTwoFields/>
      </Map>
      <FrontPagePanel/>
    </IndexNavigation>

module.exports = Page
