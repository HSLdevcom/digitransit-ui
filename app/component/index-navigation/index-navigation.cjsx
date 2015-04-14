React              = require 'react'
$                  = require 'jquery'
IndexSubNavigation = require './index-sub-navigation.cjsx'
Icon               = require '../icon/icon.cjsx'

class IndexNavigation extends React.Component
  constructor: -> 
    super
    @state =
      subNavigationVisible: false
      text: 'nyt'    

  toggleSubnavigation: => 
    if @state.subNavigationVisible
      @setState
        subNavigationVisible: false
        text: 'nyt'
      # TODO, how about this?
      $("section.content").removeClass("sub-navigation-push")
    else 
      @setState
        subNavigationVisible: true
        text: 'aika'
      $("section.content").addClass("sub-navigation-push")

  render: ->
    <header>
      <nav className="top-navigation">
        <div className="left left-icons">
          <Icon img={'icon-icon_menu'} className="cursor-pointer" id="reveal-left-offcanvas"/>
          <Icon img={'icon-icon_caution'} className="cursor-pointer disruption-info-inactive"/>
        </div>
        <div className="text-center">
          <Icon img={'icon-icon_HSL-logo'}/>
          <span className="title">Reittiopas Demo</span>
        </div>
        <div className="right-icons">
          <button className="sub-navigation-switch" onClick={@toggleSubnavigation}>{@state.text}</button>
        </div>        
        <IndexSubNavigation visible={@state.subNavigationVisible}/>
      </nav>
    </header>

module.exports = IndexNavigation