React         = require 'react'
CityBikeActions = require '../../action/city-bike-actions'
CityBikeMarker = require './city-bike-marker'

STOPS_MAX_ZOOM = 14

class CityBikeMarkerContainer extends React.Component

  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  componentWillMount: ->
    @context.executeAction CityBikeActions.cityBikeSearchRequest
    @context.getStore('CityBikeStore').addChangeListener @onCityBikeChange

  componentDidMount: ->
    @props.map.on 'zoomend', @onMapZoom

  componentWillUnmount: =>
    @props.map.off 'zoomend', @onMapZoom
    @context.getStore('CityBikeStore').removeChangeListener @onCityBikeChange

  onMapZoom: =>
    @forceUpdate()

  onCityBikeChange: =>
    @forceUpdate()

  getStations: ->
    stations = []
    data = @context.getStore('CityBikeStore').getData()

    data.stations.forEach (station) =>
      #TODO: set showName
      stations.push <CityBikeMarker key={station.id}
                             map={@props.map}
                             station={station}/>
    stations


  render: ->
    <div>{if STOPS_MAX_ZOOM < @props.map.getZoom() then @getStations() else ""}</div>

module.exports = CityBikeMarkerContainer
