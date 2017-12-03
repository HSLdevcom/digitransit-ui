import PropTypes from 'prop-types';
import React from 'react';
import IconMarker from './IconMarker';
import Icon from '../Icon';

export default function LocationMarker({ position, className, noText }) {
  return (
    <IconMarker
      position={position}
      className={className}
      icon={{
        element: (
          <Icon
            img={noText ? 'icon-icon_place' : 'icon-icon_mapMarker-point'}
          />
        ),
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        className,
      }}
    />
  );
}

LocationMarker.propTypes = {
  position: IconMarker.propTypes.position, // eslint-disable-line react/no-typos
  className: PropTypes.string,
  noText: PropTypes.bool,
};
