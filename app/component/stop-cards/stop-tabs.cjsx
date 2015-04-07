React        = require 'react'
Tabs         = require 'react-simpletabs'
StopCardList = require './stop-card-list'

class StopTabs extends React.Component
  render: -> 
    <Tabs>
      <Tabs.Panel title="Lähimmät">
        <StopCardList/>
      </Tabs.Panel>
      <Tabs.Panel title='Edelliset'>
        <h2>Edelliset tähän</h2>
      </Tabs.Panel>
      <Tabs.Panel title='Suosikit'>
        <h2>Suosikit tähän</h2>
      </Tabs.Panel>
    </Tabs>

module.exports = StopTabs