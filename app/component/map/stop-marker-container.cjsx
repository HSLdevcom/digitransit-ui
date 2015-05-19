React         = require 'react'
isBrowser     = window?
Popup         = if isBrowser then require 'react-leaflet/lib/Popup' else null
CircleMarker  = if isBrowser then require 'react-leaflet/lib/CircleMarker' else null
getSelector   = require '../../util/get-selector'

class StopMarkerContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  componentDidMount: -> 
    #@context.getStore('StopInformationStore').addChangeListener @onChange

  componentWillUnmount: ->
    #@context.getStore('StopInformationStore').removeChangeListener @onChange

  onChange: =>
    @forceUpdate()

  getStops: ->
    stops = []
    @context.getStore('NearestStopsStore').getStops().forEach (id) =>
      stop = @context.getStore('StopInformationStore').getStop(id)
      if stop
        color = "#007AC9" # TODO: Should come from stop
        stops.push <CircleMarker map={@props.map} key={id} center={lat: stop.lat, lng: stop.lon} radius=5 weight=4 color={color} opacity=1 fillColor="#fff" fillOpacity=1 ><Popup><div>{stop.name}</div></Popup></CircleMarker>
    stops

  render: ->
    if !@props.showStops
      return
    <div>{@getStops()}</div>

module.exports = StopMarkerContainer