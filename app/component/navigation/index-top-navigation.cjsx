React                 = require 'react'
Icon                  = require '../icon/icon'
TopNavigation         = require './top-navigation'

class IndexTopNavigation extends React.Component
  render: ->
    <TopNavigation>
      <div>
        <button className="sub-navigation-switch" onClick={@props.toggleSubnavigation}>{@props.subnavigationText}</button>
      </div>
      <div>
        <Icon img={'icon-icon_caution'} className="cursor-pointer disruption-info inactive"/>
      </div>
      <div onClick={@props.toggleOffcanvas}>
        <Icon img={'icon-icon_menu'} className="cursor-pointer left-off-canvas-toggle"/>
      </div>
    </TopNavigation>

module.exports = IndexTopNavigation