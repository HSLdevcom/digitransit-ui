import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

import OriginPopup from './OriginPopup';
import Icon from '../Icon';
import { isBrowser } from '../../util/browser';

let L;
let Marker;

/* eslint-disable global-require */
if (isBrowser) {
  L = require('leaflet');
  Marker = require('react-leaflet/es/Marker').default;
}
/* eslint-enable global-require */

export default function PlaceMarker(
  { displayOriginPopup, position },
  { intl },
) {
  let popup;

  if (displayOriginPopup) {
    popup = (
      <OriginPopup
        shouldOpen
        header={intl.formatMessage({ id: 'origin', defaultMessage: 'From' })}
        text={position.address}
        keyboard={false}
        yOffset={14}
      />
    );
  }

  return (
    <div>
      <Marker
        zIndexOffset={10}
        position={position}
        keyboard={false}
        icon={L.divIcon({
          html: Icon.asString('icon-icon_mapMarker-point'),
          className: 'place halo',
          iconAnchor: [12, 24],
        })}
      />
      <Marker
        keyboard={false}
        zIndexOffset={10}
        position={position}
        icon={L.divIcon({
          html: Icon.asString('icon-icon_place'),
          className: 'place',
          iconAnchor: [12, 24],
        })}
      >
        {popup}
      </Marker>
    </div>
  );
}

PlaceMarker.contextTypes = {
  intl: intlShape.isRequired,
};

PlaceMarker.propTypes = {
  displayOriginPopup: PropTypes.bool,
  position: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
  }).isRequired,
};
