React = require('react');
$ = require('jquery')
IndexSubNavigation = require('./index-sub-navigation.cjsx')

IndexNavigation = React.createClass

  getInitialState: -> 
    subNavigationVisible: false
    text: 'nyt'

  toggleSubnavigation: -> 
    if this.state.subNavigationVisible
      this.setState
        subNavigationVisible: false
        text: 'nyt'
      # TODO, how about this?
      $("section.content").removeClass("sub-navigation-push")
    else 
      this.setState
        subNavigationVisible: true
        text: 'aika'
      $("section.content").addClass("sub-navigation-push")

  render: ->

    <header>
      <nav className="top-navigation">
        <div className="left left-icons">
          <span id="reveal-left-offcanvas" className="cursor-pointer">
            <i className="icon icon-hamburger"></i>
          </span>
          <i className="icon icon-disruption-info"></i>
        </div>
        <div className="text-center">
          <i className="icon icon-hsl-logo"></i>
          <span className="title">Reittiopas</span>
        </div>
        <div className="right-icons">
          <button className="sub-navigation-switch" onClick={this.toggleSubnavigation}>{this.state.text}</button>
        </div>
        <IndexSubNavigation visible={this.state.subNavigationVisible}/>
      </nav>
    </header>

module.exports = IndexNavigation