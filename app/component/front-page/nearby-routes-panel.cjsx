React                 = require 'react'
ModeFilterContainer   = require '../route/mode-filter-container'
NoPositionPanel       = require './no-position-panel'
NearestRoutesContainer = require './nearest-routes-container'
NextDeparturesListHeader = require '../departure/next-departures-list-header'

class NearbyRoutesPanel extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    piwik: React.PropTypes.object
    router: React.PropTypes.object.isRequired
    location: React.PropTypes.object.isRequired
    executeAction: React.PropTypes.func.isRequired

  componentDidMount: ->
    @context.getStore('PositionStore').addChangeListener @onPositionStatusChange
    @context.getStore('EndpointStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('PositionStore').removeChangeListener @onPositionStatusChange
    @context.getStore('EndpointStore').removeChangeListener @onChange


  onPositionStatusChange: (status) =>
    #We want to rerender only if position status changes,
    #not if position changes
    if status.statusChanged
      @forceUpdate()

  onChange: =>
    @forceUpdate()

  render: ->
    PositionStore = @context.getStore 'PositionStore'
    location = PositionStore.getLocationState()

    origin = @context.getStore('EndpointStore').getOrigin()

    if origin?.lat
      routesPanel = <NearestRoutesContainer lat={origin.lat} lon={origin.lon}/>
    else if (location.status == PositionStore.STATUS_FOUND_LOCATION or
             location.status == PositionStore.STATUS_FOUND_ADDRESS)
      routesPanel = <NearestRoutesContainer lat={location.lat} lon={location.lon}/>
    else if location.status == PositionStore.STATUS_SEARCHING_LOCATION
      routesPanel = <div className="spinner-loader"/>
    else
      routesPanel = <NoPositionPanel/>

    <div className="frontpage-panel nearby-routes">
      <div className="row">
        <div className="medium-offset-3 medium-6 small-12 column">
          <ModeFilterContainer id="nearby-routes-mode"/>
        </div>
      </div>
      <NextDeparturesListHeader />
      <div
        className="scrollable momentum-scroll scroll-extra-padding-bottom"
        id="scrollable-routes"
        onTouchStart={@startMeasuring}
        onTouchEnd={@stopMeasuring} >
        {routesPanel}
      </div>
    </div>

module.exports = NearbyRoutesPanel
