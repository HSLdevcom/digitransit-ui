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
    router: React.PropTypes.object.isRequired
    location: React.PropTypes.object.isRequired

  toggleCustomizeSearchOffcanvas: =>
    @internalSetOffcanvas !@getOffcanvasState()

  onRequestChange: (newState) =>
    @internalSetOffcanvas newState

  internalSetOffcanvas: (newState) =>
    @setState customizeSearchOffcanvas: newState
    @context.piwik?.trackEvent "Offcanvas", "Customize Search", if newState then "close" else "open"
    if supportsHistory()
      if newState
        @context.router.push
          state: customizeSearchOffcanvas: newState
          pathname: @context.location.pathname
      else
        @context.router.goBack()

  getOffcanvasState: =>
    if typeof window != 'undefined' and supportsHistory()
      @context.location?.state?.customizeSearchOffcanvas || false
    else
      @state?.customizeSearchOffcanvas

  toggleDisruptionInfo: =>
    @context.piwik?.trackEvent "Modal", "Disruption", if @state.disruptionVisible then "close" else "open"
    @setState disruptionVisible: !@state.disruptionVisible

  render: ->
    <div className="fullscreen">
      <LeftNav className="offcanvas" disableSwipeToOpen=true openRight=true ref="rightNav" docked={false} open={@getOffcanvasState()} onRequestChange={@onRequestChange}>
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
