import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

import Icon from '../Icon';
import { isBrowser } from '../../util/browser';

let IconMarker;

/* eslint-disable global-require */
if (isBrowser) {
  IconMarker = require('./IconMarker').default;
}
/* eslint-enable global-require */

export default function PlaceMarker({ position }) {
  return (
    <div>
      <IconMarker
        zIndexOffset={10}
        position={position}
        keyboard={false}
        icon={{
          element: <Icon img="icon-icon_mapMarker-point" />,
          className: 'place halo',
          iconAnchor: [12, 24],
        }}
      />
      <IconMarker
        keyboard={false}
        zIndexOffset={10}
        position={position}
        icon={{
          element: <Icon img="icon-icon_place" />,
          className: 'place',
          iconAnchor: [12, 24],
        }}
      />
    </div>
  );
}

PlaceMarker.contextTypes = {
  intl: intlShape.isRequired, // eslint-disable-line react/no-typos
};

PlaceMarker.propTypes = {
  position: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
  }).isRequired,
};
