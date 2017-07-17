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

export default function IconMarker({ position, className, icon }) {
  return (
    <Marker
      zIndexOffset={10}
      position={position}
      keyboard={false}
      icon={L.divIcon({
        html: Icon.asString(icon),
        className,
        iconAnchor: [12, 24],
      })}
    />
  );
}

IconMarker.propTypes = {
  position: React.PropTypes.shape({
    lat: React.PropTypes.number.isRequired,
    lon: React.PropTypes.number.isRequired,
  }).isRequired,
  className: React.PropTypes.string,
  icon: React.PropTypes.string,
};
