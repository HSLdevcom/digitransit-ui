React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
Tabs                  = require 'react-simpletabs'
StopCardListContainer = require './stop-card-list-container'
NoLocationPanel       = require '../no-location-panel/no-location-panel'
Icon                  = require '../icon/icon.cjsx'

class StopTabs extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  constructor: ->
    super
    @state = @context.getStore('LocationStore').getLocationState()

  componentDidMount: ->
    @context.getStore('LocationStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('LocationStore').removeChangeListener @onChange

  onChange: =>
    @setState @context.getStore('LocationStore').getLocationState()

  render: ->
    LocationStore = @context.getStore 'LocationStore'
    if @state.status == LocationStore.STATUS_FOUND_LOCATION or @state.status == LocationStore.STATUS_FOUND_ADDRESS
      nearestPanel = <Relay.RootContainer
        Component={StopCardListContainer}
        route={new queries.StopListContainerRoute({
          lat: @state.lat
          lon: @state.lon
          })}
        renderLoading={-> <div className="spinner-loader"/>}
        renderFetched={(data) =>
          <StopCardListContainer
          key="NearestStopsStore"
            stops={data.stops}
            lat={@state.lat}
            lon={@state.lon}
          />
        }
      />
    else if @state.status == LocationStore.STATUS_NO_LOCATION or @state.status == LocationStore.STATUS_SEARCHING_LOCATION
      nearestPanel = <div className="spinner-loader"/>
    else
      nearestPanel = <NoLocationPanel/>

    <Tabs>
      <Tabs.Panel title="Lähimmät">
        {nearestPanel}
      </Tabs.Panel>
      <Tabs.Panel title='Edelliset'>
        <h2>Edelliset tähän</h2>
      </Tabs.Panel>
      <Tabs.Panel title={<Icon  className="favourite" img="icon-icon_star">Suosikit</Icon>}>
        <StopCardListContainer key="FavouriteStopsStore" store={@context.getStore 'FavouriteStopsStore'}/>
      </Tabs.Panel>
    </Tabs>

module.exports = StopTabs
