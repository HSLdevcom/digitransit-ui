React                 = require 'react'
timeUtils             = require '../../util/time-utils'
cx                    = require 'classnames'
ComponentUsageExample = require '../documentation/component-usage-example'
Example               = require '../documentation/example-data'
Map                   = require './map'
ToggleMapTracking     = require '../navigation/toggle-map-tracking'

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
    if @context.getStore('EndpointStore').getOrigin().useCurrentPosition
      #Check if we have a position already
      locationState = @context.getStore('PositionStore').getLocationState()
      @state = if locationState.hasLocation
        mapTracking: true
        useZoomedIn: true
      else
        @state = {}

    else
      @state =
        useOrigin: true
        mapTracking: false
        useZoomedIn: true

  componentWillMount: =>
    @context.getStore('PositionStore').addChangeListener @onPositionChange
    @context.getStore('EndpointStore').addChangeListener @onEndpointChange

  componentWillUnmount: =>
    @context.getStore('PositionStore').removeChangeListener @onPositionChange
    @context.getStore('EndpointStore').removeChangeListener @onEndpointChange

  componentDidMount: =>
    if @state.useZoomedIn
      @setState useZoomedIn: false


  disableMapTracking: =>
    if @state.mapTracking
      @setState
        mapTracking: false
        useZoomedIn: false

  enableMapTracking: =>
    if !@state.mapTracking
      @setState
        mapTracking: true
        useZoomedIn: false
        useOrigin: false

  onEndpointChange: (endPointChange) =>
    if endPointChange in ['set-origin']
      @setState
        useOrigin: true
        mapTracking: false

  onPositionChange: (status) =>
    if @state.mapTracking
      @forceUpdate()

  render: =>

    locationState = @context.getStore('PositionStore').getLocationState()

    if @state.mapTracking and locationState.hasLocation or @state.initLocationFound
      lat = locationState.lat
      lon = locationState.lon

    else if @state.useOrigin
      origin = @context.getStore('EndpointStore').getOrigin()
      lat = origin.lat
      lon = origin.lon

    if @state.useZoomedIn
      zoom = 16

    <Map
      className="fullscreen"
      showStops={true}
      lat={lat}
      lon={lon}
      zoom={zoom}
      leafletEvents={onDragstart: @disableMapTracking, onZoomend: @disableMapTracking}
      displayOriginPopup={true}
      disableMapTracking={@disableMapTracking}
    >
      {@props.children}
      <ToggleMapTracking
        handleClick={if @state.mapTracking then @disableMapTracking else @enableMapTracking}
        className={"icon-mapMarker-toggle-positioning-" + if @state.mapTracking then "online" else "offline"}
      />
    </Map>

module.exports = MapWithTracking
