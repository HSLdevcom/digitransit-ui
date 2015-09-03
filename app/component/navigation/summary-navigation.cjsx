React                 = require 'react'
Link                  = require 'react-router/lib/components/Link'
Icon                  = require '../icon/icon'
OffcanvasCustomize    = require './offcanvas-customize'
BackButton            = require './back-button'
TimeSelectors         = require './time-selectors'

class SummaryNavigation extends React.Component
  constructor: ->
    super
    @state =
      offcanvasCustomizeVisible: false

  toggleOffcanvasCustomize: =>
    @setState offcanvasCustomizeVisible: !@state.offcanvasCustomizeVisible

  render: ->
    <div className="fullscreen">
      <OffcanvasCustomize open={@state.offcanvasCustomizeVisible}/>

      <div className="fullscreen grid-frame">
        <div className="fixed">
          <nav className="top-bar">
            <BackButton/>
            <TimeSelectors/>
            <div onTouchTap={@toggleOffcanvasCustomize} className="icon-holder cursor-pointer right-off-canvas-toggle">
              <Icon img={'icon-icon_ellipsis'}/>
            </div>
          </nav>
        </div>
        <section ref="content" className="content">
          {@props.children}
        </section>
      </div>
    </div>

module.exports = SummaryNavigation
