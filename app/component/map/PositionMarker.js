import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import pure from 'recompose/pure';

import Icon from '../Icon';
import { isBrowser } from '../../util/browser';
import { dtLocationShape } from '../../util/shapes';

let Marker;
let L;

/* eslint-disable global-require */
if (isBrowser) {
  Marker = require('react-leaflet/es/Marker').default;
  L = require('leaflet');
}
/* eslint-enable global-require */

const currentLocationIcon = isBrowser
  ? L.divIcon({
      html: Icon.asString({ img: 'icon-icon_current-location' }),
      className: 'current-location-marker',
      iconSize: [40, 40],
    })
  : null;

function PositionMarker({ coordinates }) {
  if (coordinates === null) {
    return null;
  }

  return (
    <Marker
      keyboard={false}
      zIndexOffset={-1}
      position={[coordinates.lat, coordinates.lon]}
      icon={currentLocationIcon}
    />
  );
}

PositionMarker.propTypes = {
  coordinates: dtLocationShape,
};

PositionMarker.defaultProps = {
  coordinates: null,
};

export default connectToStores(
  pure(PositionMarker),
  ['PositionStore'],
  context => {
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
  },
);
