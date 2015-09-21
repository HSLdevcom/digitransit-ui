React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
Tabs                  = require 'react-simpletabs'
StopCardListContainer = require '../stop-cards/stop-card-list-container'
NoLocationPanel       = require './no-location-panel'
Icon                  = require '../icon/icon.cjsx'

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
    console.log @state.selectedPanel

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

    if @state.selectedPanel == 1
        panel = <h2>Linjat tähän</h2>
    else if @state.selectedPanel == 2
        panel = stopsPanel
    else if @state.selectedPanel == 3
        panel = <h2>Suosikit tähän</h2>

    <div>
      <div className="frontpage-panel">
        {panel}
      </div>
      <div className='frontpage-bottom-navigation'>
        <div className={if @state.selectPanel == 1 then "selected"}
             onClick={=> @selectPanel(1)}>
          <FormattedMessage id='routes' defaultMessage="Routes" />
        </div>
        <div className={if @state.selectPanel == 2 then "selected"}
             onClick={=> @selectPanel(2)}>
          <FormattedMessage id='stops' defaultMessage="Stops" />
        </div>
        <div className={if @state.selectPanel == 3 then "selected"}
             onClick={=> @selectPanel(3)}>
          <Icon className="favourite" img="icon-icon_star"/>
          <FormattedMessage id='favourites' defaultMessage="Favourites" />
        </div>
      </div>
    </div>

module.exports = FrontpageTabs
