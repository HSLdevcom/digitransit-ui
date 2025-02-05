import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Icon from '../Icon';
import IconMarker from './IconMarker';
import ViaPointPopup from './popups/ViaPointPopup';

export default function LocationMarker({
  position,
  className,
  isLarge,
  type,
  disabled,
}) {
  const getValidType = markertype => {
    switch (markertype) {
      case 'from':
        return 'from';
      case 'to':
        return 'to';
      case 'via':
      default:
        return 'via';
    }
  };
  const validType = getValidType(type);
  const sideLength = isLarge ? 30 : 24;
  return (
    <IconMarker
      position={position}
      className={cx(validType, className)}
      icon={{
        className: cx(validType, className),
        element: (
          <Icon
            img="icon-icon_mapMarker-map"
            color={disabled ? '#bbbbbb' : null}
          />
        ),
        iconAnchor: [sideLength / 2, sideLength],
        iconSize: [sideLength, sideLength],
      }}
      zIndexOffset={12000}
    >
      {validType === 'via' && (
        <ViaPointPopup
          lat={position.lat}
          lon={position.lon}
          key={`${position.lat}${position.lon}`}
        />
      )}
    </IconMarker>
  );
}

LocationMarker.propTypes = {
  position: IconMarker.propTypes.position,
  className: PropTypes.string,
  isLarge: PropTypes.bool,
  type: PropTypes.oneOf(['from', 'via', 'to', 'favourite']),
  disabled: PropTypes.bool,
};

LocationMarker.defaultProps = {
  position: undefined,
  className: undefined,
  isLarge: false,
  type: 'via',
  disabled: false,
};
