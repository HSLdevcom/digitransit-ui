React                       = require 'react'
Icon                        = require '../icon/icon'
CustomizeSearch             = require '../summary/customize-search'
BackButton                  = require './back-button'
TimeSelectors               = require './time-selectors'
LeftNav                     = require 'material-ui/lib/left-nav'
{supportsHistory}           = require 'history/lib/DOMUtils'

class SummaryNavigation extends React.Component
  @contextTypes:
    piwik: React.PropTypes.object
    history: React.PropTypes.object.isRequired
    location: React.PropTypes.object.isRequired

  componentDidMount: ->
    @unlistenHistory = @context.history.listen @onHistoryChange

  componentWillUnmount: ->
    @unlistenHistory() if @unlistenHistory

  onHistoryChange: (foo, event) =>
    shouldBeVisible = event?.location?.state?.customizeSearchOffcanvas || false
    @refs.rightNav.setState open: shouldBeVisible

  toggleCustomizeSearchOffcanvas: =>
    @refs.rightNav.toggle()

  openSearchOffcanvas: =>
    @internalSetOffcanvas(true)

  closeSearchOffcanvas: =>
    @internalSetOffcanvas(false)

  internalSetOffcanvas: (newState) =>
    @context.piwik?.trackEvent "Offcanvas", "Customize Search", newState ? "close" : "open"
    if supportsHistory()
      @context.history.pushState
        customizeSearchOffcanvas: newState
      , @context.location.pathname

  render: ->
    <div className="fullscreen">
      <LeftNav className="offcanvas" disableSwipeToOpen=true openRight=true ref="rightNav" docked={false} onNavOpen={@openSearchOffcanvas} onNavClose={@closeSearchOffcanvas}>
        <CustomizeSearch/>
      </LeftNav>

      <div className="fullscreen grid-frame">
        <nav className="top-bar">
          <BackButton/>
          <TimeSelectors/>
          <div onClick={@toggleCustomizeSearchOffcanvas} className="icon-holder cursor-pointer right-off-canvas-toggle">
            <Icon img={'icon-icon_ellipsis'}/>
          </div>
        </nav>
        <section ref="content" className="content">
          {@props.children}
        </section>
      </div>
    </div>

module.exports = SummaryNavigation
