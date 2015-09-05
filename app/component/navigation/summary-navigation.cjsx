React                 = require 'react'
Icon                  = require '../icon/icon'
OffcanvasCustomize    = require '../customize/offcanvas-customize'
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
<<<<<<< 449b05755df55069b98067718ba0f20bb305f986
            <div onClick={@toggleOffcanvas} className="icon-holder cursor-pointer right-off-canvas-toggle">
=======
            <div onTouchTap={@toggleOffcanvasCustomize} className="icon-holder cursor-pointer right-off-canvas-toggle">
>>>>>>> offcanvas customize button row layout
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
