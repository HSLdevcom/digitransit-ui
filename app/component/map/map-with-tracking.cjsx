React                 = require 'react'
ComponentUsageExample = require '../documentation/component-usage-example'
Map                   = require './map'
ToggleMapTracking     = require '../navigation/toggle-map-tracking'
connectToStores       = require 'fluxible-addons-react/connectToStores'
withReducer           = require('recompose/withReducer').default
pure                  = require('recompose/pure').default

mapStateReducer = (state, action) ->
  switch action
    when "enable" then {initialZoom: false, mapTracking: true}
    when "disable" then {initialZoom: false, mapTracking: false}
    else state

withMapStateTracking = withReducer 'mapTracking', 'dispatch', mapStateReducer, {initialZoom: true, mapTracking: true}

MapWithTracking = withMapStateTracking connectToStores pure(Map), ['PositionStore', 'EndpointStore'], (context, props) ->
  mapTracking = props.mapTracking.mapTracking
  PositionStore = context.getStore('PositionStore')
  position = PositionStore.getLocationState()
  origin = context.getStore('EndpointStore').getOrigin()
  location =
    if origin.useCurrentPosition
      if position.hasLocation then position else false
    else
      origin

  enableMapTracking = () -> if !mapTracking then props.dispatch 'enable'
  disableMapTracking = () -> if mapTracking then props.dispatch 'disable'

  children = React.Children.toArray(props.children)
  children.push(
    <ToggleMapTracking
      key="toggleMapTracking"
      handleClick={if mapTracking then disableMapTracking else enableMapTracking}
      className={"icon-mapMarker-toggle-positioning-" + if mapTracking then "online" else "offline"}
    />)

  lat: if mapTracking and location then location.lat
  lon: if mapTracking and location then location.lon
  zoom: if props.mapTracking.initialZoom then 16
  className: "fullscreen"
  displayOriginPopup: true
  leafletEvents: {onDragstart: disableMapTracking, onZoomend: disableMapTracking}
  disableMapTracking: disableMapTracking
  children: children

MapWithTracking.description =
  <div>
    <p>Renders a map with map-tracking functionality</p>
    <ComponentUsageExample description="">
      <MapWithTracking/>
    </ComponentUsageExample>
  </div>

module.exports = MapWithTracking
