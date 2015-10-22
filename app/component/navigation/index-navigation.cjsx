React                 = require 'react'
IndexTopNavigation    = require './index-top-navigation'
IndexSubNavigation    = require './index-sub-navigation'
OffcanvasMenu         = require './offcanvas-menu'
DisruptionInfo        = require '../disruption/disruption-info'
NotImplemented        = require '../util/not-implemented'

intl = require 'react-intl'

class IndexNavigation extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    intl: intl.intlShape.isRequired

  constructor: ->
    super
    @state =
      subNavigationVisible: false
      offcanvasVisible: false
      disruptionVisible: false
      text: if @context.getStore("TimeStore").status == "UNSET"
        @context.intl.formatMessage
          id: 'now'
          'defaultMessage': "Now"
      else
        @context.intl.formatMessage
          id: 'later'
          'defaultMessage': "Later"

  componentDidMount: ->
    @context.getStore('DisruptionStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('DisruptionStore').removeChangeListener @onChange

  onChange: =>
    @forceUpdate()

  toggleSubnavigation: =>
    if @state.subNavigationVisible
      @setState
        subNavigationVisible: false
        text: if @context.getStore("TimeStore").status == "UNSET"
          @context.intl.formatMessage
            id: 'now'
            'defaultMessage': "Now"
        else
          @context.intl.formatMessage
            id: 'later'
            'defaultMessage': "Later"

      # TODO, how about this?
      el = @refs.content.getDOMNode()
      if (el.classList)
        el.classList.remove("sub-navigation-push")
      else
        el.className = el.className.replace(new RegExp('(^|\\b)sub-navigation-push(\\b|$)', 'gi'), ' ')
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

  toggleDisruptionInfo: =>
    if @isDisruptions()
      @setState disruptionVisible: !@state.disruptionVisible

  isDisruptions: ->
    isDisruptions = false
    disruptionData = @context.getStore('DisruptionStore').getData()
    if disruptionData
      if disruptionData.entity.length > 0
        isDisruptions = true
    return isDisruptions


  render: ->
    <div className={@props.className}>
      <OffcanvasMenu open={@state.offcanvasVisible}/>
      <NotImplemented/>
      <DisruptionInfo open={@state.disruptionVisible} toggleDisruptionInfo={@toggleDisruptionInfo} />

      <div className="grid-frame fullscreen">
        <IndexTopNavigation toggleSubnavigation={@toggleSubnavigation} toggleOffcanvas={@toggleOffcanvas} toggleDisruptionInfo={@toggleDisruptionInfo} isDisruptions={@isDisruptions()} subnavigationText={@state.text}/>
        <IndexSubNavigation visible={@state.subNavigationVisible}/>
        <section ref="content" className="content fullscreen">
          {@props.children}
        </section>
      </div>
    </div>

module.exports = IndexNavigation
