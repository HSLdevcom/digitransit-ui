React                 = require 'react'
IndexTopNavigation    = require './index-top-navigation'
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
    router: React.PropTypes.object.isRequired
    location: React.PropTypes.object.isRequired

  constructor: ->
    super
    @state =
      disruptionVisible: false

  toggleOffcanvas: =>
    @internalSetOffcanvas !@getOffcanvasState()

  onRequestChange: (newState) =>
    @internalSetOffcanvas newState

  internalSetOffcanvas: (newState) =>
    @setState offcanvasVisible: newState
    @context.piwik?.trackEvent "Offcanvas", "Index", if newState then "open" else "close"
    if supportsHistory()
      if newState
        @context.router.push
          state: offcanvasVisible: newState
          pathname: @context.location.pathname + if window.location.search?.indexOf('mock') > -1 then "?mock" else ""
      else
        @context.router.goBack()

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
        <IndexTopNavigation toggleOffcanvas={@toggleOffcanvas} toggleDisruptionInfo={@toggleDisruptionInfo}/>
        <section ref="content" className="content fullscreen">
          {@props.children}
        </section>
      </div>
    </div>

module.exports = IndexNavigation
