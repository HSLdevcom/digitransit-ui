React              = require 'react'
IndexNavigation    = require '../component/index-navigation/index-navigation.cjsx'
Map                = require '../component/map/map.cjsx'
StopTabs           = require '../component/stop-cards/stop-tabs.cjsx'
SearchWithLocation = require '../component/search-with-location/search-with-location.cjsx'
LocateActions      = require '../action/locate-actions.coffee'


class Page extends React.Component
  @contextTypes:
    executeAction: React.PropTypes.func.isRequired

  componentDidMount: ->
    @context.executeAction LocateActions.findLocation

  render: ->
    <IndexNavigation>
      <Map>
        <SearchWithLocation/>
      </Map>
      <StopTabs/>
    </IndexNavigation>

module.exports = Page