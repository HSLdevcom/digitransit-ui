React              = require 'react'
IndexNavigation    = require '../component/navigation/index-navigation.cjsx'
Map                = require '../component/map/map.cjsx'
StopTabs           = require '../component/stop-cards/stop-tabs.cjsx'
SearchWithLocation = require '../component/search/search-with-location.cjsx'
LocateActions      = require '../action/locate-actions.coffee'


class Page extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  componentDidMount: ->
    if @context.getStore('LocationStore').getLocationState().status == 'no-location'
      @context.executeAction LocateActions.findLocation

  render: ->
    <IndexNavigation>
      <Map>
        <SearchWithLocation/>
      </Map>
      <StopTabs/>
    </IndexNavigation>

module.exports = Page