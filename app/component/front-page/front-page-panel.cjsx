React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
Tabs                  = require 'react-simpletabs'
Icon                  = require '../icon/icon'
cx                    = require 'classnames'
ReactCSSTransitionGroup = require 'react-addons-css-transition-group'
FavouritesPanel       = require '../favourites/favourites-panel'
NearbyRoutesPanel     = require './nearby-routes-panel'
{supportsHistory}     = require 'history/lib/DOMUtils'
Feedback              = require '../../util/feedback'
FeedbackActions       = require '../../action/feedback-action'
intl = require 'react-intl'
FormattedMessage = intl.FormattedMessage
{startMeasuring, stopMeasuring} = require '../../util/jankmeter'

class FrontPagePanel extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    intl: intl.intlShape.isRequired
    piwik: React.PropTypes.object
    router: React.PropTypes.object.isRequired
    location: React.PropTypes.object.isRequired
    executeAction: React.PropTypes.func.isRequired

  onReturnToFrontPage: ->
    if Feedback.shouldDisplayPopup(@context.getStore('TimeStore').getCurrentTime().valueOf())
      @context.executeAction FeedbackActions.openFeedbackModal

  getSelectedPanel: =>
    if typeof window != 'undefined' and supportsHistory()
      @context.location.state?.selectedPanel
    else
      @state?.selectedPanel

  selectPanel: (selection) =>
    oldSelection = @getSelectedPanel()
    if selection == oldSelection # clicks again to close
      @onReturnToFrontPage()
      newSelection = null
    else
      newSelection = selection

    if supportsHistory()
      tabOpensOrCloses = oldSelection == null or typeof oldSelection == 'undefined' or newSelection == null
      if tabOpensOrCloses
        @context.router.push
          state: selectedPanel: newSelection
          pathname: @context.location.pathname
      else
        @context.router.replace
          state: selectedPanel: newSelection
          pathname: @context.location.pathname
    else
      @setState
        selectedPanel: newSelection

  closePanel: =>
    @selectPanel @getSelectedPanel()

  startMeasuring: ->
    startMeasuring()

  stopMeasuring: =>
    results = stopMeasuring()
    if !results
      return
    # Piwik doesn't show event values, if they are too long, so we must round... >_<
    @context.piwik?.trackEvent('perf', 'nearby-panel-drag', 'min',
                               Math.round(results.min))
    @context.piwik?.trackEvent('perf', 'nearby-panel-drag', 'max',
                               Math.round(results.max))
    @context.piwik?.trackEvent('perf', 'nearby-panel-drag', 'avg',
                               Math.round(results.avg))

  render: ->
    tabClasses = []
    selectedClass =
      selected: true
    if @getSelectedPanel() == 1
      panel = <NearbyRoutesPanel />
      heading = <FormattedMessage id='near-you' defaultMessage='Near you'/>
      tabClasses[1] = selectedClass
    else if @getSelectedPanel() == 2
      panel = <FavouritesPanel />
      heading = <FormattedMessage id='your-favourites' defaultMessage='Your favourites'/>
      tabClasses[2] = selectedClass

    top = <div className="panel-top">
            <div className="panel-heading"><h2>{heading}</h2></div>
            <div className="close-icon" onClick={@closePanel}>
              <Icon img={'icon-icon_close'} />
            </div>
          </div>

    <div className="frontpage-panel-container no-select">
      <ReactCSSTransitionGroup
        transitionName="frontpage-panel-wrapper"
        transitionEnterTimeout={300}
        transitionLeaveTimeout={300} >
        {if panel
          <div className="frontpage-panel-wrapper" key="panel">
            {top}
            {panel}
          </div>}
      </ReactCSSTransitionGroup>

      <ul className='tabs-row tabs-arrow-up cursor-pointer'>
        <li className={cx (tabClasses[1]), 'small-6', 'h4', 'hover', 'nearby-routes'}
            onClick={=>
              @context.piwik?.trackEvent "Front page tabs", "Nearby", if @state?.selectedPanel == 1 then "close" else "open"
              @selectPanel(1)
            }>
          <Icon className="prefix-icon" img="icon-icon_bus-withoutBox"/>
          <FormattedMessage id='near-you' defaultMessage="Near you" />
        </li>
        <li className={cx (tabClasses[2]), 'small-6', 'h4', 'hover', 'favourites'}
            onClick={=>
              @context.piwik?.trackEvent "Front page tabs", "Favourites", if @state?.selectedPanel == 2 then "close" else "open"
              @selectPanel(2)
            }>
          <Icon className="prefix-icon" img="icon-icon_star"/>
          <FormattedMessage id='your-favourites' defaultMessage="Your favourites" />
        </li>
      </ul>
    </div>

module.exports = FrontPagePanel
