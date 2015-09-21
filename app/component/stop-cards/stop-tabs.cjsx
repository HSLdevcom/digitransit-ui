React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
Tabs                  = require 'react-simpletabs'
StopCardListContainer = require './stop-card-list-container'
NoLocationPanel       = require '../no-location-panel/no-location-panel'
Icon                  = require '../icon/icon.cjsx'

intl = require('react-intl')
FormattedMessage = intl.FormattedMessage

class StopTabs extends React.Component
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

  getContainer: (lat, lon) =>
    <Relay.RootContainer
      Component={StopCardListContainer}
      route={new queries.StopListContainerRoute({
        lat: lat
        lon: lon
        })}
      renderLoading={-> <div className="spinner-loader"/>}
      }
    />

  render: ->
    favouritesTitle = <span><Icon className="favourite" img="icon-icon_star"/>
      &nbsp;{@context.intl.formatMessage({id: "favourites", defaultMessage: "Favourites"})}</span>
    LocationStore = @context.getStore 'LocationStore'
    if @state.origin and @state.origin.lat
      nearestPanel = @getContainer(@state.origin.lat, @state.origin.lon)
    else if (@state.status == LocationStore.STATUS_FOUND_LOCATION or
             @state.status == LocationStore.STATUS_FOUND_ADDRESS)
      nearestPanel = @getContainer(@state.lat, @state.lon)
    else if @state.status == LocationStore.STATUS_SEARCHING_LOCATION
      nearestPanel = <div className="spinner-loader"/>
    else
      nearestPanel = <NoLocationPanel/>

    <Tabs>
      <Tabs.Panel
        title={@context.intl.formatMessage({id: 'nearest', defaultMessage: "Nearest"})} >
        {nearestPanel}
      </Tabs.Panel>
      <Tabs.Panel
        title={@context.intl.formatMessage({id: 'previous', defaultMessage: "Previous"})} >
        <h2>Edelliset tähän</h2>
      </Tabs.Panel>
      <Tabs.Panel title={favouritesTitle}>
        <StopCardListContainer key="FavouriteStopsStore" store={@context.getStore 'FavouriteStopsStore'}/>
      </Tabs.Panel>
    </Tabs>

module.exports = StopTabs
