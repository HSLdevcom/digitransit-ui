React                 = require 'react'
IndexTopNavigation    = require './index-top-navigation'
IndexSubNavigation    = require './index-sub-navigation'
OffcanvasMenu         = require './offcanvas-menu'

class IndexNavigation extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  constructor: ->
    super
    @state =
      subNavigationVisible: false
      offcanvasVisible: false
      text: if @context.getStore("TimeStore").status == "UNSET" then "Nyt" else "Myöhemmin"

  toggleSubnavigation: =>
    if @state.subNavigationVisible
      @setState
        subNavigationVisible: false
        text: if @context.getStore("TimeStore").status == "UNSET" then "Nyt" else "Myöhemmin"
      # TODO, how about this?
      el = @refs.content.getDOMNode()
      if (el.classList)
        el.classList.remove("sub-navigation-push");
      else
        el.className = el.className.replace(new RegExp('(^|\\b)sub-navigation-push(\\b|$)', 'gi'), ' ');
    else
      @setState
        subNavigationVisible: true
        text: 'aika'
      el = @refs.content.getDOMNode()
      if el.classList
        el.classList.add "sub-navigation-push"
      else
        el.className += " sub-navigation-push"

  toggleOffcanvas: =>
    @setState offcanvasVisible: !@state.offcanvasVisible

  render: ->
    <div>
      <OffcanvasMenu open={@state.offcanvasVisible}/>

      <div className="grid-frame">
        <IndexTopNavigation toggleSubnavigation={@toggleSubnavigation} toggleOffcanvas={@toggleOffcanvas} subnavigationText={@state.text}/>
        <IndexSubNavigation visible={@state.subNavigationVisible}/>
        <section ref="content" className="content">
          {@props.children}
        </section>
      </div>
    </div>

module.exports = IndexNavigation
