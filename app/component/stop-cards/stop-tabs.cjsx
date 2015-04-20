React               = require 'react'
Tabs                = require 'react-simpletabs'
StopCardList        = require './stop-card-list'
NoLocationPanel     = require '../no-location-panel/no-location-panel'
LocationStore       = require '../../store/location-store.coffee'
NearestStopsStore   = require '../../store/nearest-stops-store.coffee'
FavouriteStopsStore = require '../../store/favourite-stops-store.coffee'

class StopTabs extends React.Component
  constructor: -> 
    super
    @state = LocationStore.getLocationState() 

  componentDidMount: -> 
    LocationStore.addChangeListener @onChange

  componentWillUnmount: ->
    LocationStore.removeChangeListener @onChange

  onChange: =>
    @setState LocationStore.getLocationState()

  render: -> 
    if @state.status == LocationStore.STATUS_FOUND_LOCATION or @state.status == LocationStore.STATUS_FOUND_ADDRESS
      nearestPanel = <StopCardList key="NearestStopsStore" store={NearestStopsStore}/>
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
        <StopCardList key="FavouriteStopsStore" store={FavouriteStopsStore}/>
      </Tabs.Panel>
    </Tabs>

module.exports = StopTabs