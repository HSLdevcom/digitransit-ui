React              = require 'react'
IndexNavigation    = require '../component/index-navigation/index-navigation.cjsx'
Map                = require '../component/map/map.cjsx'
StopTabs           = require '../component/stop-cards/stop-tabs.cjsx'
SearchWithLocation = require '../component/search-with-location/search-with-location.cjsx'

Page = React.createClass
  render: ->
    <IndexNavigation>
      <Map>
        <SearchWithLocation/>
      </Map>
      <StopTabs/>
    </IndexNavigation>

module.exports = Page