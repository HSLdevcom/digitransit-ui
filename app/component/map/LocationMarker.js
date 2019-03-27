import PropTypes from 'prop-types';
import React from 'react';
import IconMarker from './IconMarker';
import Icon from '../Icon';

const getIconImg = type => {
  switch (type) {
    case 'from':
      return 'mapMarker-from';
    case 'via':
    default:
      return 'mapMarker-via';
    case 'to':
      return 'mapMarker-to';
  }
};

export default function LocationMarker({ position, className, isLarge, type }) {
  const sideLength = isLarge ? 30 : 24;
  return (
    <IconMarker
      position={position}
      className={className}
      icon={{
        className,
        element: <Icon img={`icon-icon_${getIconImg(type)}`} />,
        iconAnchor: [sideLength / 2, sideLength],
        iconSize: [sideLength, sideLength],
      }}
    />
  );
}

LocationMarker.propTypes = {
  position: IconMarker.propTypes.position, // eslint-disable-line react/no-typos
  className: PropTypes.string,
  isLarge: PropTypes.bool,
  type: PropTypes.oneOf(['from', 'via', 'to']),
};

LocationMarker.defaultProps = {
  isLarge: false,
  type: 'via',
};
