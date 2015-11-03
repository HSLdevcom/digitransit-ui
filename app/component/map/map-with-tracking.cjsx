React                 = require 'react'
timeUtils             = require '../../util/time-utils'
cx                    = require 'classnames'
ComponentUsageExample = require '../documentation/component-usage-example'
Example               = require '../documentation/example-data'
Map                   = require './map.cjsx'
ToggleMapTracking     = require '../navigation/toggle-map-tracking'
MapTrackActions       = require '../../action/map-track-actions'
config                = require '../../config'

class MapWithTracking extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  constructor: ->
    super
    #Check if we have a position already
    locationState = @context.getStore('PositionStore').getLocationState()
    if locationState.hasLocation
      initialZoom = 16
      initialLat = locationState.lat
      initialLon = locationState.lon
    else
      initialZoom = config.initialLocation.zoom
      initialLat = config.initialLocation.lat
      initialLon = config.initialLocation.lon

    @state =
      zoom: initialZoom
      lat: initialLat
      lon: initialLon

  componentWillMount: =>
    @context.getStore('MapTrackStore').addChangeListener @onTrackStatusChange
    @context.getStore('PositionStore').addChangeListener @onPositionChange

  componentWillUnmount: =>
    @context.getStore('MapTrackStore').removeChangeListener @onTrackStatusChange
    @context.getStore('PositionStore').removeChangeListener @onPositionChange

  disableMapTrack: =>
    @context.executeAction MapTrackActions.endMapTrack

  onTrackStatusChange: =>
    locationState = @context.getStore('PositionStore').getLocationState()
    trackState = @context.getStore('MapTrackStore').getMapTrackState()

    if locationState.hasLocation and trackState
      @setState
        zoom: undefined
        lat: locationState.lat
        lon: locationState.lon
    else
      @setState
        zoom: undefined
        lat: undefined
        lon: undefined

  onPositionChange: (status) =>
    locationState = @context.getStore('PositionStore').getLocationState()
    trackState = @context.getStore('MapTrackStore').getMapTrackState()

    if locationState.hasLocation and trackState
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
        () => @context.executeAction MapTrackActions.startMapTrack #start map track because position was found

  render: =>
    <Map className="fullscreen" showStops={true} lat={@state.lat} lon={@state.lon} zoom={@state.zoom} disableMapTrack={@disableMapTrack}>
      {@props.children}
      <ToggleMapTracking tracking={@context.getStore('MapTrackStore').getMapTrackState()}
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
