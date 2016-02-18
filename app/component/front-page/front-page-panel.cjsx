React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
Tabs                  = require 'react-simpletabs'
ModeFilterContainer   = require '../route/mode-filter-container'
NoPositionPanel       = require './no-position-panel'
Icon                  = require '../icon/icon.cjsx'
cx                    = require 'classnames'
ReactCSSTransitionGroup = require 'react-addons-css-transition-group'
FavouritesPanel       = require '../favourites/favourites-panel'
NearestRoutesContainer = require './nearest-routes-container'
NextDeparturesListHeader = require '../departure/next-departures-list-header'
{supportsHistory}     = require 'history/lib/DOMUtils'
Feedback              = require '../../util/feedback'
FeedbackActions       = require '../../action/feedback-action'

intl = require 'react-intl'
FormattedMessage = intl.FormattedMessage

class FrontPagePanel extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    intl: intl.intlShape.isRequired
    piwik: React.PropTypes.object
    history: React.PropTypes.object.isRequired
    location: React.PropTypes.object.isRequired
    executeAction: React.PropTypes.func.isRequired

  componentDidMount: ->
    @context.getStore('PositionStore').addChangeListener @onGeolocationChange
    @context.getStore('EndpointStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('PositionStore').removeChangeListener @onGeolocationChange
    @context.getStore('EndpointStore').removeChangeListener @onChange

  onGeolocationChange: (status) =>
    #We want to rerender only if position status changes,
    #not if position changes
    if status.statusChanged
      @forceUpdate()

  onChange: =>
    @forceUpdate()

  onReturnToFrontPage: ->
    if Feedback.shouldDisplayPopup()
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
        @context.history.pushState
          selectedPanel: newSelection
        , @context.location.pathname
      else
        @context.history.replaceState
          selectedPanel: newSelection
        , @context.location.pathname
    else
      @setState
        selectedPanel: newSelection

  render: ->
    PositionStore = @context.getStore 'PositionStore'
    location = PositionStore.getLocationState()
    origin = @context.getStore('EndpointStore').getOrigin()

    if origin?.lat
      routesPanel = <NearestRoutesContainer lat={origin.lat} lon={origin.lon}/>
    else if (location.status == PositionStore.STATUS_FOUND_LOCATION or
             location.status == PositionStore.STATUS_FOUND_ADDRESS)
      routesPanel = <NearestRoutesContainer lat={location.lat} lon={location.lon}/>
    else if location.status == PositionStore.STATUS_SEARCHING_LOCATION
      routesPanel = <div className="spinner-loader"/>
    else
      routesPanel = <NoPositionPanel/>

    favouritesPanel = <FavouritesPanel/>

    tabClasses = []
    selectedClass =
      selected: true
    if @getSelectedPanel() == 1
      panel = <div className="frontpage-panel-wrapper" key="panel">
                <div className="frontpage-panel nearby-routes">
                  <div className="row">
                    <div className="medium-offset-3 medium-6 small-12 column">
                      <ModeFilterContainer id="nearby-routes-mode"/>
                    </div>
                  </div>
                  <NextDeparturesListHeader />
                  <div className="scrollable momentum-scroll scroll-extra-padding-bottom" id="scrollable-routes">
                    {routesPanel}
                  </div>
                </div>
              </div>
      tabClasses[1] = selectedClass
    else if @getSelectedPanel() == 2
      panel = <div className="frontpage-panel-wrapper" key="panel">
                {favouritesPanel}
              </div>
      tabClasses[2] = selectedClass

    <div className="frontpage-panel-container no-select">
      <ReactCSSTransitionGroup
        transitionName="frontpage-panel-wrapper"
        transitionEnterTimeout={300}
        transitionLeaveTimeout={300}
      >
        {panel}
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
