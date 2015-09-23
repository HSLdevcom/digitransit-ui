React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
Tabs                  = require 'react-simpletabs'
StopCardListContainer = require '../stop-cards/stop-card-list-container'
NoLocationPanel       = require './no-location-panel'
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
      Component={StopCardListContainer}
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

    tabClasses = []
    selectedClass =
      selected:true
    if @state.selectedPanel == 1
        panel = <h2>Linjat tähän</h2>
        tabClasses[1] = selectedClass
    else if @state.selectedPanel == 2
        panel = stopsPanel
        tabClasses[2] = selectedClass
    else if @state.selectedPanel == 3
        panel = <h2>Suosikit tähän</h2>
        tabClasses[3] = selectedClass

    <div className="frontpage">
      <div className="frontpage-panel">
        {panel}
      </div>
      <ul className='tabs'>
        <li className={classnames (tabClasses[1]), "small-4", "h4"}
             onClick={=> @selectPanel(1)}>
          <Icon className="prefix-icon" img="icon-icon_bus-withoutBox"/>
          <FormattedMessage id='routes' defaultMessage="Routes" />
        </li>
        <li className={classnames (tabClasses[2]), "small-4", "h4"}
             onClick={=> @selectPanel(2)}>
          <Icon className="prefix-icon" img="icon-icon_bus-stop"/>
          <FormattedMessage id='stops' defaultMessage="Stops" />
        </li>
        <li className={classnames (tabClasses[3]), "small-4", "h4"}
             onClick={=> @selectPanel(3)}>
          <Icon className="prefix-icon" img="icon-icon_star"/>
          <FormattedMessage id='favourites' defaultMessage="Favourites" />
        </li>
      </ul>
    </div>

module.exports = FrontpageTabs
