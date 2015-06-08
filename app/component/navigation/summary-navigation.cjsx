React                 = require 'react'
Link                  = require 'react-router/lib/components/Link'
Icon                  = require '../icon/icon'
Offcanvas             = require '../util/offcanvas'
BackButton            = require './back-button'

class SummaryNavigation extends React.Component
  constructor: -> 
    super
    @state =
      offcanvasVisible: false

  toggleOffcanvas: =>
    @setState offcanvasVisible: !@state.offcanvasVisible

  render: ->
    <div className="fullscreen">
      <Offcanvas open={@state.offcanvasVisible} position="right"/>
      <div className="fullscreen grid-frame">
        <div className="fixed">
          <nav className="top-bar">
            <BackButton/>
            <div onTouchTap={@toggleOffcanvas} className="icon-holder cursor-pointer right-off-canvas-toggle">
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
