React                 = require 'react'
timeUtils             = require '../../util/time-utils'
cx                    = require 'classnames'
ComponentUsageExample = require '../documentation/component-usage-example'
Example               = require '../documentation/example-data'
Map                   = require './map.cjsx'
ToggleMapTracking     = require '../navigation/toggle-map-tracking'
config                = require '../../config'

class MapWithTracking extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  constructor: ->
    super
    #Check if we have a position already
    locationState = @context.getStore('PositionStore').getLocationState()
    @state = if locationState.hasLocation
      zoom: 16
      lat: locationState.lat
      lon: locationState.lon
    else
      zoom: config.initialLocation.zoom
      lat: config.initialLocation.lat
      lon: config.initialLocation.lon

  componentWillMount: =>
    @context.getStore('PositionStore').addChangeListener @onPositionChange

  componentWillUnmount: =>
    @context.getStore('PositionStore').removeChangeListener @onPositionChange

  disableMapTracking: =>
    @setState
      mapTracking: false
      zoom: undefined
      lat: undefined
      lon: undefined

  enableMapTracking: =>
    locationState = @context.getStore('PositionStore').getLocationState()

    if locationState.hasLocation
      @setState
        mapTracking: true
        zoom: undefined
        lat: locationState.lat
        lon: locationState.lon
    else
      @setState
        mapTracking: true
        zoom: undefined
        lat: undefined
        lon: undefined

  onPositionChange: (status) =>
    locationState = @context.getStore('PositionStore').getLocationState()

    if locationState.hasLocation and @state.mapTracking
      newLat = locationState.lat
      newLon = locationState.lon
      @setState
        lat: newLat
        lon: newLon

    if status.statusChanged
      @setState
        zoom: 16
        lat: locationState.lat
        lon: locationState.lon
        @enableMapTracking #start map track because position was found

  render: =>
    <Map className="fullscreen" showStops={true} lat={@state.lat} lon={@state.lon} zoom={@state.zoom} disableMapTracking={@disableMapTracking}>
      {@props.children}
      <ToggleMapTracking tracking={@state.mapTracking}
                         disableMapTracking={@disableMapTracking}
                         enableMapTracking={@enableMapTracking}
                         onlineClassName="icon-mapMarker-toggle-positioning-online"
                         offlineClassName="icon-mapMarker-toggle-positioning-offline"/>
    </Map>

MapWithTracking.description =
  <div>
    <p>Renders a map with map-tracking functionality</p>
    <ComponentUsageExample description="">
      <MapWithTracking/>
    </ComponentUsageExample>
  </div>

MapWithTracking.displayName = "MapWithTracking"

module.exports = MapWithTracking
