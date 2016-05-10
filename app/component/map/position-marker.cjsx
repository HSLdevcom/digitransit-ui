React         = require 'react'
isBrowser     = window?
Marker        = if isBrowser then require('react-leaflet/lib/Marker').default
L             = if isBrowser then require 'leaflet'
Icon          = require '../icon/icon'
connectToStores = require 'fluxible-addons-react/connectToStores'
shouldUpdate  = require('recompose/shouldUpdate').default
Popup            = if isBrowser then require('./dynamic-popup').default


currentLocationIcon =
  if isBrowser then L.divIcon
    html: Icon.asString 'icon-icon_mapMarker-location-animated'
    className: 'current-location-marker'
    iconSize: [40, 40]
  else null


PositionMarker = ({coordinates, map, layerContainer, children}, context) ->
  if coordinates
    <Marker
      map={map}
      layerContainer={layerContainer}
      zIndexOffset=5
      position={coordinates}
      icon={currentLocationIcon}
    >
      <Popup
        context={context}
        map={map}
        layerContainer={layerContainer}
        offset={[50, 0]}
        closeButton={false}
        maxWidth={config.map.genericMarker.popup.maxWidth}
        className="origin-popup">
          <div onClick={() =>
            context.executeAction SearchActions.openDialog, "origin"}>
            <div className="origin-popup">A<Icon className="right-arrow" img={'icon-icon_arrow-collapse--right'}/></div>
            <div>
              <div className="origin-popup-name">B</div>
              <div className="shade-to-white"></div>
            </div>
          </div>
      </Popup>
    </Marker>
  else
    null

module.exports = connectToStores PositionMarker, ['PositionStore'], (context, props) ->
  coordinates = context.getStore('PositionStore').getLocationState()
  coordinates:
    if coordinates.hasLocation
      [coordinates.lat, coordinates.lon]
    else false
