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

  @description:
    <div>
      <p>Renders a map with map-tracking functionality</p>
      <ComponentUsageExample description="">
        <MapWithTracking/>
      </ComponentUsageExample>
    </div>

  @displayName: "MapWithTracking"

  constructor: ->
    super
    #Check if we have a position already
    locationState = @context.getStore('PositionStore').getLocationState()
    @state = if locationState.hasLocation
      mapTracking: true
      useZoomedIn: true
    else
      useConfig: true
      mapTracking: false

  componentWillMount: =>
    @context.getStore('PositionStore').addChangeListener @onPositionChange

  componentWillUnmount: =>
    @context.getStore('PositionStore').removeChangeListener @onPositionChange

  disableMapTracking: =>
    @setState
      mapTracking: false
      useConfig: false
      useZoomedIn: false

  enableMapTracking: =>
    @setState
      mapTracking: true
      useConfig: false
      useZoomedIn: false

  onPositionChange: (status) =>
    locationState = @context.getStore('PositionStore').getLocationState()

    if locationState.hasLocation
      if status.statusChanged
        @setState
          useConfig: false
          useZoomedIn: true
          () => @setState
            useZoomedIn: false
            mapTracking: true #start map track because position was found
      else
        @forceUpdate()

  render: =>

    locationState = @context.getStore('PositionStore').getLocationState()

    if @state.mapTracking and locationState.hasLocation
      lat = locationState.lat
      lon = locationState.lon
    else if @state.useConfig
      zoom = config.initialLocation.zoom
      lat = config.initialLocation.lat
      lon = config.initialLocation.lon

    if @state.useZoomedIn
      zoom = 16

    <Map
      className="fullscreen"
      showStops={true}
      lat={lat}
      lon={lon}
      zoom={zoom}
      disableMapTracking={@disableMapTracking}
    >
      {@props.children}
      <ToggleMapTracking
        tracking={@state.mapTracking}
        handleClick={if @state.mapTracking then @disableMapTracking else @enableMapTracking}
        className={"icon-mapMarker-toggle-positioning-" + if @state.mapTracking then "online" else "offline"}
      />
    </Map>

module.exports = MapWithTracking
