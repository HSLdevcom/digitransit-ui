isBrowser     = window?
React         = require 'react'
Leaflet       = if isBrowser then require 'react-leaflet' else null
LocationStore = require '../../store/location-store' 


class Map extends React.Component
  constructor: -> 
    super
    @state =
      location: [60.17332, 24.94102]
      zoom: 11
      hasLocation: false

  componentDidMount: -> 
    LocationStore.addChangeListener @onLocationChange
    @onLocationChange()

  componentWillUnmount: ->
    LocationStore.removeChangeListener @onLocationChange

  onLocationChange: =>
    coordinates = LocationStore.getLocationState()
    if (coordinates.lat != 0 || coordinates.lon != 0)
      @setState
        location: [coordinates.lat, coordinates.lon]
        zoom: 15
        hasLocation: true

  render: ->
    if isBrowser
      if @state.hasLocation == true
        marker = <Leaflet.Marker position={@state.location} />

      map =
        <Leaflet.Map 
          center={[@state.location[0]+0.001, @state.location[1]]}
          zoom={@state.zoom}
          zoomControl=false>
          <Leaflet.TileLayer
            url="http://matka.hsl.fi/hsl-map/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          {marker}
        </Leaflet.Map>

    <div className="map">
      {map}
      {@props.children}
      <div className="fullscreen-toggle"></div>
    </div>

module.exports = Map