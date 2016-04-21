React              = require 'react'
Relay              = require 'react-relay'
queries            = require '../queries'
IndexNavigation    = require '../component/navigation/index-navigation'
FrontPagePanel     = require '../component/front-page/front-page-panel'
SearchMainContainer = require '../component/search/search-main-container'
Icon               = require '../component/icon/icon'
Link               = require 'react-router/lib/Link'
MapWithTracking    = require '../component/map/map-with-tracking'
FeedbackPanel      = require '../component/feedback/feedback-panel'

class Page extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  render: ->
    <IndexNavigation className="front-page fullscreen">
      <MapWithTracking>
        <SearchMainContainer/>
      </MapWithTracking>
      <FrontPagePanel/>
      <FeedbackPanel/>
    </IndexNavigation>

module.exports = Page
