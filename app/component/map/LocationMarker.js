import PropTypes from 'prop-types';
import React from 'react';
import IconMarker from './IconMarker';

export default function LocationMarker({ position, className, noText }) {
  return (
    <IconMarker
      position={position}
      className={className}
      icon={noText ? 'icon-icon_place' : 'icon-icon_mapMarker-point'}
    />
  );
}

LocationMarker.propTypes = {
  position: IconMarker.propTypes.position,
  className: PropTypes.string,
  noText: PropTypes.bool,
};
