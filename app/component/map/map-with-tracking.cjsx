React                 = require 'react'
ComponentUsageExample = require '../documentation/component-usage-example'
Map                   = require './map'
ToggleMapTracking     = require '../navigation/toggle-map-tracking'
connectToStores       = require 'fluxible-addons-react/connectToStores'
withReducer           = require('recompose/withReducer').default
pure                  = require('recompose/pure').default

mapStateReducer = (state, action) ->
  switch action.type
    when "enable" then Object.assign {}, state, {initialZoom: false, mapTracking: true, focusOnOrigin: false}
    when "disable" then Object.assign {}, state, {initialZoom: false, mapTracking: false, focusOnOrigin: false}
    when "useOrigin" then Object.assign {}, state, {initialZoom: false, mapTracking: false, focusOnOrigin: true, previousOrigin: action.origin}
    else state

withMapStateTracking = withReducer 'mapState', 'dispatch', mapStateReducer, (props) ->
  initialZoom: true
  mapTracking: true
  focusOnOrigin: false


MapWithTracking = withMapStateTracking connectToStores pure(Map), ['PositionStore', 'EndpointStore'], (context, props) ->
  mapTracking = props.mapState.mapTracking
  PositionStore = context.getStore('PositionStore')
  position = PositionStore.getLocationState()
  origin = context.getStore('EndpointStore').getOrigin()
  location =
    if props.mapState.focusOnOrigin and !origin.useCurrentPosition
      origin
    else if mapTracking and position.hasLocation
      position
    else
      false

  if origin != props.mapState.previousOrigin
    setImmediate props.dispatch, {type: 'useOrigin', origin: origin}

  enableMapTracking = () -> if !mapTracking then props.dispatch type: 'enable'
  disableMapTracking = () -> if mapTracking then props.dispatch type: 'disable'

  children = React.Children.toArray(props.children)
  children.push(
    <ToggleMapTracking
      key="toggleMapTracking"
      handleClick={if mapTracking then disableMapTracking else enableMapTracking}
      className={"icon-mapMarker-toggle-positioning-" + if mapTracking then "online" else "offline"}
    />)

  lat: if location then location.lat
  lon: if location then location.lon
  zoom: if props.mapState.initialZoom then 16
  className: "fullscreen"
  displayOriginPopup: true
  leafletEvents: {onDragstart: disableMapTracking, onZoomend: disableMapTracking}
  disableMapTracking: disableMapTracking
  children: children

MapWithTracking.contextTypes =
  getStore: React.PropTypes.func.isRequired

MapWithTracking.description =
  <div>
    <p>Renders a map with map-tracking functionality</p>
    <ComponentUsageExample description="">
      <MapWithTracking/>
    </ComponentUsageExample>
  </div>

module.exports = MapWithTracking
