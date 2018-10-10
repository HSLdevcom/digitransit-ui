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
    <IconMarker
      icon={{
        className: 'place',
        element: <Icon img="icon-icon_mapMarker-from" />,
        iconAnchor: [12, 24],
      }}
      keyboard={false}
      position={position}
      zIndexOffset={10}
    />
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
