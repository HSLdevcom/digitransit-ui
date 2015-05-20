React         = require 'react'
isBrowser     = window?
Popup         = if isBrowser then require 'react-leaflet/lib/Popup' else null
CircleMarker  = if isBrowser then require 'react-leaflet/lib/CircleMarker' else null
getSelector   = require '../../util/get-selector'
StopMarkerPopup = require './stop-marker-popup'
NearestStopsAction = require '../../action/nearest-stops-action'

class StopMarkerContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  componentDidMount: -> 
    @props.map.on 'moveend', @onMapMove
    @context.getStore('NearestStopsStore').addChangeListener @onChange

  componentWillUnmount: ->
    @props.map.off 'moveend', @onMapMove
    @context.getStore('NearestStopsStore').removeChangeListener @onChange

  onChange: (type) =>
    if type == 'rectangle'
      @forceUpdate()

  onMapMove: =>
    if 15 < @props.map.getZoom()
      bounds = @props.map.getBounds()
      @context.executeAction NearestStopsAction.stopsInRectangleRequest, 
        minLat: bounds.getSouth()
        minLon: bounds.getWest()
        maxLat: bounds.getNorth()
        maxLon: bounds.getEast()

  getStops: ->
    stops = []
    @context.getStore('NearestStopsStore').getStopsInRectangle().forEach (stop) =>
      if @context.getStore('StopInformationStore').getStop(stop.id)
        stop = @context.getStore('StopInformationStore').getStop(stop.id)
      if stop
        color = "#007AC9" # TODO: Should come from stop
        stops.push <CircleMarker map={@props.map} key={stop.id} center={lat: stop.lat, lng: stop.lon} radius=4 weight=2 fillColor={color} opacity=1 color="#fff" fillOpacity=1 >
            <Popup><StopMarkerPopup stop={stop}/></Popup>
          </CircleMarker>
    stops

  render: ->
    if !@props.showStops
      return false
    <div>{@getStops()}</div>

module.exports = StopMarkerContainer