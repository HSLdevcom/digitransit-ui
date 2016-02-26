React                         = require 'react'
Icon                          = require '../icon/icon'
config                        = require '../../config'
TopNavigation                 = require './top-navigation'
DisruptionInfoButtonContainer = require '../disruption/disruption-info-button-container'

class IndexTopNavigation extends React.Component
  render: ->
    <TopNavigation>
      <div onClick={@props.toggleSubnavigation} className="icon-holder cursor-pointer sub-navigation-switch">
        <button>{@props.subnavigationText}</button>
      </div>
      <DisruptionInfoButtonContainer toggleDisruptionInfo={@props.toggleDisruptionInfo}/>

      {if config.leftMenu.show
        <div onClick={@props.toggleOffcanvas} className="icon-holder cursor-pointer left-off-canvas-toggle">
          <Icon img={'icon-icon_menu'} className="icon" />
        </div>}
    </TopNavigation>


module.exports = IndexTopNavigation
