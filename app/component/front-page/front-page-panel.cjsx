React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
Tabs                  = require 'react-simpletabs'
NearStopCardListContainer = require '../stop-cards/near-stop-card-list-container'
NoLocationPanel       = require './no-location-panel'
FavouritesPanel     = require './favourites-panel'
Icon                  = require '../icon/icon.cjsx'
classnames            = require 'classnames'

intl = require('react-intl')
FormattedMessage = intl.FormattedMessage

class FrontpageTabs extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    intl: intl.intlShape.isRequired

  constructor: ->
    super
    @state = @context.getStore('LocationStore').getLocationState()

  componentDidMount: ->
    @context.getStore('LocationStore').addChangeListener @onPositionChange
    @context.getStore('EndpointStore').addChangeListener @onEndpointChange

  componentWillUnmount: ->
    @context.getStore('LocationStore').removeChangeListener @onPositionChange
    @context.getStore('EndpointStore').removeChangeListener @onEndpointChange

  onPositionChange: =>
    @setState @context.getStore('LocationStore').getLocationState()

  onEndpointChange: =>
    # This does not override the position; new object properties are merged to state
    @setState
      origin: Object.assign({}, @context.getStore('EndpointStore').getOrigin())

  getStopContainer: (lat, lon) =>
    <Relay.RootContainer
      Component={NearStopCardListContainer}
      route={new queries.StopListContainerRoute({
        lat: lat
        lon: lon
        })}
      renderLoading={-> <div className="spinner-loader"/>}
      }
    />

  selectPanel: (selection) =>
    if selection == @state.selectedPanel
      @setState
        selectedPanel: null
    else
      @setState
        selectedPanel: selection

  render: ->
    LocationStore = @context.getStore 'LocationStore'
    if @state.origin and @state.origin.lat
      stopsPanel = @getStopContainer(@state.origin.lat, @state.origin.lon)
    else if (@state.status == LocationStore.STATUS_FOUND_LOCATION or
             @state.status == LocationStore.STATUS_FOUND_ADDRESS)
      stopsPanel = @getStopContainer(@state.lat, @state.lon)
    else if @state.status == LocationStore.STATUS_SEARCHING_LOCATION
      stopsPanel = <div className="spinner-loader"/>
    else
      stopsPanel = <NoLocationPanel/>


    favouritesPanel = <FavouritesPanel/>

    tabClasses = []
    selectedClass =
      selected:true
    switch @state.selectedPanel
      when 'nearby-routes'
        panel = <div className="frontpage-panel-wrapper">
                  <div className="frontpage-panel">
                    <div className="row">
                      <h3><FormattedMessage id='nearby-routes' defaultMessage='Nearby routes'/></h3>
                    </div>
                  </div>
                </div>
        tabClasses['nearby-routes'] = selectedClass
       when 'nearby-stops'
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
        tabClasses['nearby-stops'] = selectedClass
      when 'favourites'
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
        tabClasses['favourites'] = selectedClass
    <div className="frontpage-panel-container">
      {panel}
      <ul className='tabs-row tabs-arrow-up'>
        <li className={classnames (tabClasses['nearby-routes']), 'small-4', 'h4', 'hover'}
             onClick={=> @selectPanel('nearby-routes')}>
          <Icon className="prefix-icon" img="icon-icon_bus-withoutBox"/>
          <FormattedMessage id='routes' defaultMessage="Routes" />
        </li>
        <li className={classnames (tabClasses['nearby-stops']), 'small-4', 'h4', 'hover'}
             onClick={=> @selectPanel('nearby-stops')}>
          <Icon className="prefix-icon" img="icon-icon_bus-stop"/>
          <FormattedMessage id='stops' defaultMessage="Stops" />
        </li>
        <li className={classnames (tabClasses['favourites']), 'small-4', 'h4', 'hover'}
             onClick={=> @selectPanel('favourites')}>
          <Icon className="prefix-icon" img="icon-icon_star"/>
          <FormattedMessage id='favourites' defaultMessage="Favourites" />
        </li>
      </ul>
    </div>

module.exports = FrontpageTabs
