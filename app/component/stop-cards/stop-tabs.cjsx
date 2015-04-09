React           = require 'react'
Tabs            = require 'react-simpletabs'
StopCardList    = require './stop-card-list'
NoLocationPanel = require '../no-location-panel/no-location-panel'
LocationStore   = require '../../store/location-store.coffee'

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
    if @state.status == LocationStore.STATUS_NO_LOCATION
      panel = <NoLocationPanel/>
    else 
      panel = <StopCardList/>

    <Tabs>
      <Tabs.Panel title="Lähimmät">
        {panel}
      </Tabs.Panel>
      <Tabs.Panel title='Edelliset'>
        <h2>Edelliset tähän</h2>
      </Tabs.Panel>
      <Tabs.Panel title='Suosikit'>
        <h2>Suosikit tähän</h2>
      </Tabs.Panel>
    </Tabs>

module.exports = StopTabs