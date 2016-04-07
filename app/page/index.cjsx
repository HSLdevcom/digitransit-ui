React              = require 'react'
Relay              = require 'react-relay'
queries            = require '../queries'
IndexNavigation    = require '../component/navigation/index-navigation'
FrontPagePanel     = require '../component/front-page/front-page-panel'
SearchTwoFieldsContainer = require '../component/search/search-two-fields-container'
Icon               = require '../component/icon/icon'
Link               = require 'react-router/lib/Link'
MapWithTracking    = require '../component/map/map-with-tracking'
FeedbackPanel      = require '../component/feedback/feedback-panel'
config             = require '../config'

class Page extends React.Component
  constructor: ->
    super
    @state =
      frontPagePanelOpen: false

  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  shouldComponentUpdate: (nextProps, nextState) ->
    true

  frontPagePanelOpen: (open) =>
    console.log "frontPagePanelOpen open? #{open}"
    @setState
      frontPagePanelOpen: open

  render: ->
    console.log "render index Page"
    hideMap = @state.frontPagePanelOpen and config.frontPagePanel.useFullPage

    <IndexNavigation className="front-page fullscreen">
      {if !hideMap
        <MapWithTracking>
          <SearchTwoFieldsContainer/>
          </MapWithTracking>}
      <FrontPagePanel frontPagePanelOpen={@frontPagePanelOpen} className={if config.frontPagePanel.useFullPage then "use-full-page"} />
      <FeedbackPanel/>
    </IndexNavigation>

module.exports = Page
