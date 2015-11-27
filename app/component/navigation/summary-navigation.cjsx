React                       = require 'react'
Icon                        = require '../icon/icon'
CustomizeSearch             = require '../summary/customize-search'
BackButton                  = require './back-button'
TimeSelectors               = require './time-selectors'
LeftNav                     = require 'material-ui/lib/left-nav'

class SummaryNavigation extends React.Component
  @contextTypes:
    piwik: React.PropTypes.object

  constructor: ->
    super
    @state =
      customizeSearchOffcanvas: false

  toggleCustomizeSearchOffcanvas: =>
    @context.piwik?.trackEvent "Offcanvas", "Customize Search", if @state.customizeSearchOffcanvas then "close" else "open"
    @setState customizeSearchOffcanvas: !@state.customizeSearchOffcanvas
    @refs.rightNav.toggle()

  render: ->
    <div className="fullscreen">
      <LeftNav className="offcanvas" disableSwipeToOpen=true openRight=true ref="rightNav" docked={false} open={@state.offcanvasVisible}>
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
