React               = require 'react'
Tabs                = require 'react-simpletabs'
StopCardList        = require './stop-card-list'
NoLocationPanel     = require '../no-location-panel/no-location-panel'

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
      nearestPanel = <StopCardList key="NearestStopsStore" store={@context.getStore 'NearestStopsStore'}/>
    else 
      nearestPanel = <NoLocationPanel/>

    <Tabs>
      <Tabs.Panel title="Lähimmät">
        {nearestPanel}
      </Tabs.Panel>
      <Tabs.Panel title='Edelliset'>
        <h2>Edelliset tähän</h2>
      </Tabs.Panel>
      <Tabs.Panel title='Suosikit'>
        <StopCardList key="FavouriteStopsStore" store={@context.getStore 'FavouriteStopsStore'}/>
      </Tabs.Panel>
    </Tabs>

module.exports = StopTabs