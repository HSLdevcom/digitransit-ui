React                 = require 'react'
IndexTopNavigation    = require './index-top-navigation'
IndexSubNavigation    = require './index-sub-navigation'
OffcanvasMenu         = require './offcanvas-menu'
DisruptionInfo        = require '../disruption/disruption-info'
NotImplemented        = require '../util/not-implemented'
LeftNav               = require 'material-ui/lib/left-nav'
FeedbackActions       = require '../../action/feedback-action'
{supportsHistory}     = require 'history/lib/DOMUtils'

intl = require 'react-intl'

class IndexNavigation extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    intl: intl.intlShape.isRequired
    piwik: React.PropTypes.object
    history: React.PropTypes.object.isRequired
    location: React.PropTypes.object.isRequired

  constructor: ->
    super
    @state =
      subNavigationVisible: false
      disruptionVisible: false
      text: unless @context.getStore("TimeStore").isSelectedTimeSet()
        @context.intl.formatMessage
          id: 'now'
          defaultMessage: "Now"
      else
        @context.intl.formatMessage
          id: 'later'
          defaultMessage: "Later"

  toggleSubnavigation: =>
    if @state.subNavigationVisible
      @setState
        subNavigationVisible: false
        text: unless @context.getStore("TimeStore").isSelectedStatusSet()
          @context.intl.formatMessage
            id: 'now'
            defaultMessage: "Now"
        else
          @context.intl.formatMessage
            id: 'later'
            defaultMessage: "Later"

      # TODO, how about this?
      el = @refs.content.getDOMNode()
      if (el.classList)
        el.classList.remove("sub-navigation-push")
      else
        el.className = el.className.replace(new RegExp('(^|\\b)sub-navigation-push(\\b|$)', 'gi'), ' ')
    else
      @setState
        subNavigationVisible: true
        text: @context.intl.formatMessage(
          id: 'time'
          defaultMessage: "Time")
      el = @refs.content.getDOMNode()
      if el.classList
        el.classList.add "sub-navigation-push"
      else
        el.className += " sub-navigation-push"

  toggleOffcanvas: =>
    @internalSetOffcanvas !@getOffcanvasState()

  onRequestChange: (newState) =>
    @internalSetOffcanvas newState

  internalSetOffcanvas: (newState) =>
    @setState offcanvasVisible: newState
    @context.piwik?.trackEvent "Offcanvas", "Index", if newState then "open" else "close"
    if supportsHistory()
      if newState
        @context.history.pushState
          offcanvasVisible: newState
        , @context.location.pathname + if window.location.search?.indexOf('mock') > -1 then "?mock" else ""
      else
        @context.history.goBack()

  getOffcanvasState: =>
    if typeof window != 'undefined' and supportsHistory()
      @context.location?.state?.offcanvasVisible || false
    else
      @state?.offcanvasVisible

  toggleDisruptionInfo: =>
    @context.piwik?.trackEvent "Modal", "Disruption", if @state.disruptionVisible then "close" else "open"
    @setState disruptionVisible: !@state.disruptionVisible

  openFeedback: () =>
    @context.executeAction FeedbackActions.openFeedbackModal
    @toggleOffcanvas()

  render: ->
    <div className={@props.className}>
      <NotImplemented/>
      <DisruptionInfo open={@state.disruptionVisible} toggleDisruptionInfo={@toggleDisruptionInfo} />
      <LeftNav className="offcanvas" disableSwipeToOpen=true ref="leftNav" docked={false} open={@getOffcanvasState()} onRequestChange={@onRequestChange}>
        <OffcanvasMenu openFeedback={@openFeedback}/>
      </LeftNav>
      <div className="grid-frame fullscreen">
        <IndexTopNavigation toggleSubnavigation={@toggleSubnavigation} toggleOffcanvas={@toggleOffcanvas} toggleDisruptionInfo={@toggleDisruptionInfo} subnavigationText={@state.text}/>
        <IndexSubNavigation visible={@state.subNavigationVisible}/>
        <section ref="content" className="content fullscreen">
          {@props.children}
        </section>
      </div>
    </div>

module.exports = IndexNavigation
