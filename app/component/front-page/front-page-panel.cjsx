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

intl = require 'react-intl'
FormattedMessage = intl.FormattedMessage

class FrontPagePanel extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    intl: intl.intlShape.isRequired

  componentDidMount: ->
    @context.getStore('PositionStore').addChangeListener @onChange
    @context.getStore('TimeStore').addChangeListener @onChange
    @context.getStore('EndpointStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('PositionStore').removeChangeListener @onChange
    @context.getStore('EndpointStore').removeChangeListener @onChange
    @context.getStore('TimeStore').removeChangeListener @onChange

  onChange: =>
    console.log("force updating");
    @forceUpdate()

  getStopContainer: (lat, lon) =>
    <Relay.RootContainer
      Component={StopCardListContainer}
      forceFetch={true}
      route={new queries.StopListContainerRoute
        lat: lat
        lon: lon
      }
      renderLoading={-> <div className="spinner-loader"/>}
      }
    />

  getRoutesContainer: (lat, lon) =>
    <Relay.RootContainer
      Component={RouteListContainer}
      forceFetch={true}
      route={new queries.RouteListContainerRoute
        lat: lat
        lon: lon
      }
      renderLoading={-> <div className="spinner-loader"/>}
    />

  selectPanel: (selection) =>
    if selection == @state?.selectedPanel
      @setState
        selectedPanel: null
    else
      @setState
        selectedPanel: selection

  #force redraw when location changed

  render: ->
    PositionStore = @context.getStore 'PositionStore'
    location = PositionStore.getLocationState()
    origin = @context.getStore('EndpointStore').getOrigin()


    if origin?.lat
      stopsPanel = @getStopContainer(origin.lat, origin.lon)
      routesPanel = @getRoutesContainer(origin.lat, origin.lon)
    else if (location.status == PositionStore.STATUS_FOUND_LOCATION or
             location.status == PositionStore.STATUS_FOUND_ADDRESS)
      stopsPanel = @getStopContainer(location.lat, location.lon)
      routesPanel = @getRoutesContainer(location.lat, location.lon)
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
    if @state?.selectedPanel == 1
      panel = <div className="frontpage-panel-wrapper">
                <div className="frontpage-panel nearby-routes">
                  <div className="row">
                    <h3>
                      <ModeFilter id="nearby-routes-mode"/>
                      <FormattedMessage id='nearby-routes' defaultMessage='Nearby routes'/>
                    </h3>
                  </div>

                  <div className="scrollable">
                    {routesPanel}
                  </div>
                </div>
              </div>
      tabClasses[1] = selectedClass
    else if @state?.selectedPanel == 2
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
    else if @state?.selectedPanel == 3
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

    <div className="frontpage-panel-container">
      {panel}
      <ul className='tabs-row tabs-arrow-up cursor-pointer'>
        <li className={cx (tabClasses[1]), 'small-4', 'h4', 'hover'}
             onClick={=> @selectPanel(1)}>
          <Icon className="prefix-icon" img="icon-icon_bus-withoutBox"/>
          <FormattedMessage id='routes' defaultMessage="Routes" />
        </li>
        <li className={cx (tabClasses[2]), 'small-4', 'h4', 'hover'}
             onClick={=> @selectPanel(2)}>
          <Icon className="prefix-icon" img="icon-icon_bus-stop"/>
          <FormattedMessage id='stops' defaultMessage="Stops" />
        </li>
        <li className={cx (tabClasses[3]), 'small-4', 'h4', 'hover'}
             onClick={=> @selectPanel(3)}>
          <Icon className="prefix-icon" img="icon-icon_star"/>
          <FormattedMessage id='favourites' defaultMessage="Favourites" />
        </li>
      </ul>
    </div>

module.exports = FrontPagePanel
