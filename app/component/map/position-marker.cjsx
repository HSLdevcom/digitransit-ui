React         = require 'react'
isBrowser     = window?
Marker        = if isBrowser then require('react-leaflet/lib/Marker').default
L             = if isBrowser then require 'leaflet'
Icon          = require '../icon/icon'
connectToStores = require 'fluxible-addons-react/connectToStores'
pure          = require('recompose/pure').default

currentLocationIcon =
  if isBrowser then L.divIcon
    html: Icon.asString 'icon-icon_mapMarker-location-animated'
    className: 'current-location-marker'
    iconSize: [40, 40]
  else null

PositionMarker = pure ({coordinates, map, layerContainer}) ->
  if coordinates
    <Marker
      map={map}
      layerContainer={layerContainer}
      zIndexOffset=5
      position={coordinates}
      icon={currentLocationIcon}/>
  else
    null

module.exports = connectToStores PositionMarker, ['PositionStore'], (context, props) ->
  coordinates = context.getStore('PositionStore').getLocationState()
  coordinates:
    if coordinates.hasLocation
      [coordinates.lat, coordinates.lon]
    else false
