import React from 'react';
import Marker from 'react-leaflet/es/Marker';
import { default as L } from 'leaflet';
import { renderAsString } from '../../../utils/client/mapIconUtils';

import Icon from '../Icon';
import { usePosition } from '../../hooks/PositionContext';

const currentLocationIcon = L.divIcon({
  html: renderAsString(<Icon img="icon_current-location" />),
  className: 'current-location-marker',
  iconSize: [40, 40],
});

export default function PositionMarker() {
  const position = usePosition();
  return (
    position.hasLocation && (
      <Marker
        keyboard={false}
        zIndexOffset={20000}
        position={[position.lat, position.lon]}
        icon={currentLocationIcon}
      />
    )
  );
}
