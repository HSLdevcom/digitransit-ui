import React from 'react';
import Icon from '../Icon';

import { isBrowser } from '../../util/browser';

let L;
let Marker;

/* eslint-disable global-require */
if (isBrowser) {
  L = require('leaflet');
  Marker = require('react-leaflet/lib/Marker').default;
}
/* eslint-enaable global-require */

export default function LocationMarker({ position, className }) {
  return (
    <Marker
      zIndexOffset={10}
      position={position}
      keyboard={false}
      icon={L.divIcon({
        html: Icon.asString('icon-icon_mapMarker-point'),
        className,
        iconAnchor: [12, 24],
      })}
    />
  );
}

LocationMarker.propTypes = {
  position: React.PropTypes.shape({
    lat: React.PropTypes.number.isRequired,
    lon: React.PropTypes.number.isRequired,
  }).isRequired,
  className: React.PropTypes.string,
};
