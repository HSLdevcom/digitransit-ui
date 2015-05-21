React         = require 'react'
isBrowser     = window?
DynamicPopup  = if isBrowser then require './dynamic-popup' else null
CircleMarker  = if isBrowser then require 'react-leaflet/lib/CircleMarker' else null
getSelector   = require '../../util/get-selector'
StopMarkerPopup = require './stop-marker-popup'
NearestStopsAction = require '../../action/nearest-stops-action'
FavouriteStopsActions = require '../../action/favourite-stops-action'
L             = if isBrowser then require 'leaflet' else null


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
    else
      @forceUpdate()

  getStops: ->
    stops = []
    @context.getStore('NearestStopsStore').getStopsInRectangle().forEach (stop) =>
      if @context.getStore('StopInformationStore').getStop(stop.id)
        stop = @context.getStore('StopInformationStore').getStop(stop.id)
      if stop
        color = "#007AC9" # TODO: Should come from stop
        #https://github.com/codebusters/react-leaflet/commit/c7b897e3ef429774323c7d8130f2fae504779b1a
        favourite = @context.getStore('FavouriteStopsStore').isFavourite(stop.id)
        addFavouriteStop = (e) =>
          e.stopPropagation()
          @context.executeAction FavouriteStopsActions.addFavouriteStop, stop.id
        popup = <DynamicPopup options={{offset: [106, 3], closeButton:false, maxWidth:250, minWidth:250, className:"stop-marker-popup"}}><StopMarkerPopup stop={stop} favourite={favourite} addFavouriteStop={addFavouriteStop}/></DynamicPopup>
        stops.push <CircleMarker map={@props.map} key={stop.id} center={lat: stop.lat, lng: stop.lon} radius=4 weight=2 color={color} opacity=1 fillColor="#fff" fillOpacity=1 >{popup}</CircleMarker>
    stops

  render: ->
    <div>{if 15 < @props.map.getZoom() then @getStops() else ""}</div>

module.exports = StopMarkerContainer