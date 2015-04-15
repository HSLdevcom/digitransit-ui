React                 = require 'react'
Icon                  = require '../icon/icon.cjsx'
IndexSubNavigation    = require './index-sub-navigation.cjsx'
if window?
  Foundation          = require 'foundation-shim'
  FoundationOffcanvas = require 'foundation-offcanvas-shim'
  $                   = require 'jquery'

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

  componentDidMount: -> 
    if window?
      $('.off-canvas-wrap').foundation()  

  render: ->
    <div className="off-canvas-wrap" data-offcanvas>
      <div className="inner-wrap">
        <div className="fixed">
          <nav className="tab-bar" data-topbar>
            <section className="left-small" id="reveal-left-offcanvas">
              <Icon img={'icon-icon_menu'} className="cursor-pointer left-off-canvas-toggle"/>
            </section>
            
            <section className="middle tab-bar-section">
              <Icon img={'icon-icon_caution'} className="cursor-pointer disruption-info inactive"/>
              <Icon img={'icon-icon_HSL-logo'} className="logo"/>
              <span className="title">Reittiopas Demo</span>
            </section>

            <section className="right">
              <button className="sub-navigation-switch" onClick={@toggleSubnavigation}>{@state.text}</button>
            </section>
          </nav>
        </div>

        <IndexSubNavigation visible={@state.subNavigationVisible}/>

        <aside className="left-off-canvas-menu">
          <header className="offcanvas-header offcanvas-section">
            <p className="offcanvas-lead">
                Kirjautumalla palveluun saat suosikit talteen ja voit hyödyntää niitä muillakin laitteillasi
            </p>
            <div className="offcanvas-login">
              <div className="inline-block">
                <Icon img={'icon-icon_user'} className="large"/>
              </div>
              <div className="inline-block">  
                <p>
                  <a href="#">Luo tunnus <Icon img={'icon-icon_arrow-right'} className="small"/></a>
                </p>
                <p>
                  <a href="#">Kirjaudu sisään <Icon img={'icon-icon_arrow-right'} className="small"/></a>
                </p>
              </div>
            </div> 
          </header>
          
          <section className="offcanvas-section">
            <ul className="offcanvas-list">
              <li><a href="#">Matkaliput <Icon img={'icon-icon_arrow-right'} className="medium"/></a></li>
              <li><a href="#">Linjat <Icon img={'icon-icon_arrow-right'} className="medium"/></a></li>
              <li><a href="#">Pysäkit <Icon img={'icon-icon_arrow-right'} className="medium"/></a></li>
              <li><a href="#">Asetukset <Icon img={'icon-icon_arrow-right'} className="medium"/></a></li>
              <li><a href="#">Käyttöehdot <Icon img={'icon-icon_arrow-right'} className="medium"/></a></li>
              <li><a href="#">HSL:n yhteystiedot <Icon img={'icon-icon_arrow-right'} className="medium"/></a></li>
            </ul>
          </section>
        </aside>

        <section className="content">
          {@props.children}
        </section>
      </div>
    </div>

module.exports = IndexNavigation
