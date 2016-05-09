React                         = require 'react'
Icon                          = require '../icon/icon'
config                        = require '../../config'
TopNavigation                 = require './top-navigation'
DisruptionInfoContainer = require('../disruption/disruption-info-container').default

class IndexTopNavigation extends React.Component
  render: ->
    <TopNavigation>
      <DisruptionInfoContainer />
      {if config.leftMenu.show
        <div onClick={@props.toggleOffcanvas} className="icon-holder cursor-pointer left-off-canvas-toggle">
          <Icon img={'icon-icon_menu'} className="icon" />
        </div>}
    </TopNavigation>


module.exports = IndexTopNavigation
