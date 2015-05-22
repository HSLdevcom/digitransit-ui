React         = require 'react'
isBrowser     = window?
DynamicPopup  = if isBrowser then require './dynamic-popup' else null
CircleMarker  = if isBrowser then require 'react-leaflet/lib/CircleMarker' else null
getSelector   = require '../../util/get-selector'
StopMarkerPopup = require './stop-marker-popup'
NearestStopsAction = require '../../action/nearest-stops-action'
FavouriteStopsAction = require '../../action/favourite-stops-action'
L             = if isBrowser then require 'leaflet' else null

STOPS_MAX_ZOOM = 14

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
    if STOPS_MAX_ZOOM < @props.map.getZoom()
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
    getFrom = () =>
      @context.getStore('LocationStore').getLocationString()
    @context.getStore('NearestStopsStore').getStopsInRectangle().forEach (stop) =>
      if @context.getStore('StopInformationStore').getStop(stop.id)
        stop = @context.getStore('StopInformationStore').getStop(stop.id)
      if stop
        color = "#007AC9" # TODO: Should come from stop
        #https://github.com/codebusters/react-leaflet/commit/c7b897e3ef429774323c7d8130f2fae504779b1a
        favourite = @context.getStore('FavouriteStopsStore').isFavourite(stop.id)
        addFavouriteStop = (e) =>
          e.stopPropagation()
          @context.executeAction FavouriteStopsAction.addFavouriteStop, stop.id
        popup = 
          <DynamicPopup options={{offset: [106, 3], closeButton:false, maxWidth:250, minWidth:250, className:"stop-marker-popup"}}>
            <StopMarkerPopup stop={stop} favourite={favourite} addFavouriteStop={addFavouriteStop} getFrom={getFrom} stopInformationStore={@context.getStore('StopInformationStore')} executeAction={@context.executeAction}/>
          </DynamicPopup>
        stops.push <CircleMarker map={@props.map} key={stop.id + "outline"} center={lat: stop.lat, lng: stop.lon} radius=8 weight=1 color="#333" opacity=0.4 fillColor="#fff" fillOpacity=1 />
        stops.push <CircleMarker map={@props.map} key={stop.id} center={lat: stop.lat, lng: stop.lon} radius=4.5 weight=4 color={color} opacity=1 fillColor="#fff" fillOpacity=1 >{popup}</CircleMarker>

    stops

  render: ->
    <div>{if STOPS_MAX_ZOOM < @props.map.getZoom() then @getStops() else ""}</div>

module.exports = StopMarkerContainer