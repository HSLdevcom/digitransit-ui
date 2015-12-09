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

  constructor: ->
    super
    @offcanvasChanging = false
    @state =
      customizeSearchOffcanvas: false

  componentDidMount: ->
    @unlistenHistory = @context.history.listen @onHistoryChange

  componentWillUnmount: ->
    @unlistenHistory() if @unlistenHistory

  onHistoryChange: (foo, event) =>
    shouldBeVisible = event?.location?.state?.customizeSearchOffcanvas || false
    @setState
      offcanvasVisible: shouldBeVisible
    if !@offcanvasChanging # caused by history navigation or user action?
      if !@refs.rightNav.state.open and shouldBeVisible
        @refs.rightNav.toggle()
      else if @refs.rightNav.state.open and !shouldBeVisible
        @refs.rightNav.close()

  toggleCustomizeSearchOffcanvas: =>
    @refs.rightNav.toggle()

  openOffcanvas: =>
    @internalSetOffcanvas(true)

  closeOffcanvas: =>
    @internalSetOffcanvas(false)

  internalSetOffcanvas: (newState) =>
    @offcanvasChanging = true
    @context.piwik?.trackEvent "Offcanvas", "Customize Search", newState ? "close" : "open"
    if supportsHistory()
      @context.history.pushState
        customizeSearchOffcanvas: newState
      , @context.location.pathname
    else
      @setState customizeSearchOffcanvas: newState
    @offcanvasChanging = false

  render: ->
    <div className="fullscreen">
      <LeftNav className="offcanvas" disableSwipeToOpen=true openRight=true ref="rightNav" docked={false} onNavOpen={@openOffcanvas} onNavClose={@closeOffCanvas}>
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
