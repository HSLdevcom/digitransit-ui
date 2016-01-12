React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
Tabs                  = require 'react-simpletabs'
RouteListContainer    = require '../route/route-list-container'
StopCardListContainer = require '../stop-cards/nearest-stop-card-list-container'
ModeFilter            = require '../route/mode-filter'
NoPositionPanel       = require './no-position-panel'
Icon                  = require '../icon/icon.cjsx'
cx                    = require 'classnames'
FavouritesPanel       = require '../favourites/favourites-panel'
NearestRoutesContainer = require './nearest-routes-container'
NearestStopsContainer = require './nearest-stops-container'
{supportsHistory}     = require 'history/lib/DOMUtils'

intl = require 'react-intl'
FormattedMessage = intl.FormattedMessage

class FrontPagePanel extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    intl: intl.intlShape.isRequired
    piwik: React.PropTypes.object
    history: React.PropTypes.object.isRequired
    location: React.PropTypes.object.isRequired

  componentDidMount: ->
    @context.getStore('PositionStore').addChangeListener @onGeolocationChange
    @context.getStore('EndpointStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('PositionStore').removeChangeListener @onGeolocationChange
    @context.getStore('EndpointStore').removeChangeListener @onChange

  onGeolocationChange: (statusChanged) =>
    #We want to rerender only if position status changes,
    #not if position changes
    if statusChanged
      @forceUpdate()

  onChange: =>
    @forceUpdate()

  getSelectedPanel: =>
    if typeof window != 'undefined' and supportsHistory()
      @context.location.state?.selectedPanel
    else
      @state?.selectedPanel

  selectPanel: (selection) =>
    oldSelection = @getSelectedPanel()
    if selection == oldSelection # clicks again to close
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
      stopsPanel = <NearestStopsContainer lat={origin.lat} lon={origin.lon}/>
      routesPanel = <NearestRoutesContainer lat={origin.lat} lon={origin.lon}/>
    else if (location.status == PositionStore.STATUS_FOUND_LOCATION or
             location.status == PositionStore.STATUS_FOUND_ADDRESS)
      stopsPanel = <NearestStopsContainer lat={location.lat} lon={location.lon}/>
      routesPanel = <NearestRoutesContainer lat={location.lat} lon={location.lon}/>
    else if location.status == PositionStore.STATUS_SEARCHING_LOCATION
      stopsPanel = <div className="spinner-loader"/>
      routesPanel = <div className="spinner-loader"/>
    else
      stopsPanel = <NoPositionPanel/>
      routesPanel = <NoPositionPanel/>

    favouritesPanel = <FavouritesPanel/>

    tabClasses = []
    selectedClass =
      selected: true
    if @getSelectedPanel() == 1
      panel = <div className="frontpage-panel-wrapper">
                <div className="frontpage-panel nearby-routes">
                  <div className="row">
                    <h3>
                      <ModeFilter id="nearby-routes-mode"/>
                      <FormattedMessage id='nearby-routes' defaultMessage='Nearby routes'/>
                    </h3>
                  </div>

                  <div className="scrollable" id="scrollable-routes">
                    {routesPanel}
                  </div>
                </div>
              </div>
      tabClasses[1] = selectedClass
    else if @getSelectedPanel() == 2
      panel = <div className="frontpage-panel-wrapper">
                <div className="frontpage-panel">
                  <div className="row">
                    <h3><FormattedMessage id='nearby-stops' defaultMessage='Nearby stops'/></h3>
                  </div>
                  <div className="scrollable">
                    {stopsPanel}
                  </div>
                </div>
              </div>
      tabClasses[2] = selectedClass
    else if @getSelectedPanel() == 3
      panel = <div className="frontpage-panel-wrapper">
                <div className="frontpage-panel">
                  <div className="row">
                    <h3><FormattedMessage id='favourites' defaultMessage='Favourites'/></h3>
                  </div>
                  <div className="scrollable">
                    {favouritesPanel}
                  </div>
                </div>
              </div>
      tabClasses[3] = selectedClass

    <div className="frontpage-panel-container no-select">
      {panel}
      <ul className='tabs-row tabs-arrow-up cursor-pointer'>
        <li className={cx (tabClasses[1]), 'small-4', 'h4', 'hover', 'nearby-routes'}
            onClick={=>
              @context.piwik?.trackEvent "Front page tabs", "Routes", if @state?.selectedPanel == 1 then "close" else "open"
              @selectPanel(1)
            }>
          <Icon className="prefix-icon" img="icon-icon_bus-withoutBox"/>
          <FormattedMessage id='routes' defaultMessage="Routes" />
        </li>
        <li className={cx (tabClasses[2]), 'small-4', 'h4', 'hover', 'nearby-stops'}
            onClick={=>
              @context.piwik?.trackEvent "Front page tabs", "Stops", if @state?.selectedPanel == 2 then "close" else "open"
              @selectPanel(2)
            }>
          <Icon className="prefix-icon" img="icon-icon_bus-stop"/>
          <FormattedMessage id='stops' defaultMessage="Stops" />
        </li>
        <li className={cx (tabClasses[3]), 'small-4', 'h4', 'hover', 'favourites'}
            onClick={=>
              @context.piwik?.trackEvent "Front page tabs", "Favourites", if @state?.selectedPanel == 3 then "close" else "open"
              @selectPanel(3)
            }>
          <Icon className="prefix-icon" img="icon-icon_star"/>
          <FormattedMessage id='favourites' defaultMessage="Favourites" />
        </li>
      </ul>
    </div>

module.exports = FrontPagePanel
