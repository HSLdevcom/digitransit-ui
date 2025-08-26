import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Marker from 'react-leaflet/es/Marker';
import { default as L } from 'leaflet';

import Icon from '../Icon';
import { locationShape } from '../../util/shapes';

const currentLocationIcon = L.divIcon({
  html: Icon.asString({ img: 'icon-icon_current-location' }),
  className: 'current-location-marker',
  iconSize: [40, 40],
});

function PositionMarker({ coordinates }) {
  if (coordinates === null) {
    return null;
  }

  return (
    <Marker
      keyboard={false}
      zIndexOffset={20000}
      position={[coordinates.lat, coordinates.lon]}
      icon={currentLocationIcon}
    />
  );
}

PositionMarker.propTypes = {
  coordinates: locationShape,
};

PositionMarker.defaultProps = {
  coordinates: null,
};

export default connectToStores(PositionMarker, ['PositionStore'], context => {
  const coordinates = context.getStore('PositionStore').getLocationState();

  return {
    coordinates: coordinates.hasLocation
      ? {
          lat: coordinates.lat,
          lon: coordinates.lon,
          address: coordinates.address,
        }
      : null,
  };
});
