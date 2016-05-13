React         = require 'react'
isBrowser     = window?
Marker        = if isBrowser then require('react-leaflet/lib/Marker').default
OriginPopup   = require './origin-popup'
L             = if isBrowser then require 'leaflet'
Icon          = require '../icon/icon'
connectToStores = require 'fluxible-addons-react/connectToStores'
pure  = require('recompose/pure').default
{intlShape} = require('react-intl')


currentLocationIcon =
  if isBrowser then L.divIcon
    html: Icon.asString 'icon-icon_mapMarker-location-animated'
    className: 'current-location-marker'
    iconSize: [40, 40]
  else null


PositionMarker = ({coordinates, map, layerContainer, useCurrentPosition, displayOriginPopup}, {intl}) ->
  if coordinates
    if displayOriginPopup
      if useCurrentPosition
        popup =
          <OriginPopup
            shouldOpen={true}
            header={intl.formatMessage {id: 'origin', defaultMessage: 'From'}}
            text={intl.formatMessage  {id: 'own-position', defaultMessage: 'Your current position'}}
            yOffset={0}
          />
      else #Use this to set the text when the origin is not the position
        popup =
          <OriginPopup
            shouldOpen={false}
            header={intl.formatMessage {id: 'origin', defaultMessage: 'From'}}
            text={intl.formatMessage  {id: 'own-position', defaultMessage: 'Your current position'}}
            yOffset={0}
          />

    <Marker
      map={map}
      layerContainer={layerContainer}
      zIndexOffset=5
      position={coordinates}
      icon={currentLocationIcon}
    >
      {popup}
    </Marker>
  else
    null

PositionMarker.contextTypes =
  intl: intlShape.isRequired

module.exports = connectToStores pure(PositionMarker), ['PositionStore', 'EndpointStore'], (context, props) ->
  coordinates = context.getStore('PositionStore').getLocationState()
  useCurrentPosition: context.getStore('EndpointStore').getOrigin().useCurrentPosition
  coordinates:
    if coordinates.hasLocation
      [coordinates.lat, coordinates.lon]
    else false
