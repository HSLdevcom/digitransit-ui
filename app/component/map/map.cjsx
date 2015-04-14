React         = require 'react'
if window?
  Leaflet       = require 'react-leaflet'
LocationStore = require '../../store/location-store' 


class Map extends React.Component
  constructor: -> 
    super
    @state = center: [60.17332, 24.94102]

  componentDidMount: -> 
    LocationStore.addChangeListener @onLocationChange
    @onLocationChange()

  componentWillUnmount: ->
    LocationStore.removeChangeListener @onLocationChange

  onLocationChange: =>
    coordinates = LocationStore.getLocationState()
    if (coordinates.lat != 0 || coordinates.lon != 0)
      @setState center: [coordinates.lat, coordinates.lon]

  render: ->
    if window?
      <div className="map">
        <Leaflet.Map center={@state.center} zoom={13}>
          <Leaflet.TileLayer
            url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
        </Leaflet.Map>
        {@props.children}
        <div className="fullscreen-toggle"></div>
      </div>
    else
      <div className="map">
        {@props.children}
        <div className="fullscreen-toggle"></div>
      </div>

module.exports = Map