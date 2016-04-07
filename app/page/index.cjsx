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
      frontPageOpen: false

  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired


  shouldComponentUpdate: (nextProps, nextState) ->
    true

  frontPageOpen: (open) =>
    console.log "frontpage open? #{open}"
    @setState
      frontPageOpen: open

  render: ->
    console.log "render index Page"
    <IndexNavigation className="front-page fullscreen">
      {if !@state.frontPageOpen or !config.frontPagePanel.useFullPage
        <MapWithTracking>
          <SearchTwoFieldsContainer/>
          </MapWithTracking>}
      <FrontPagePanel frontPageOpen={@frontPageOpen} />
      <FeedbackPanel/>
    </IndexNavigation>

module.exports = Page
