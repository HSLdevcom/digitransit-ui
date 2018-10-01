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

export default function LocationMarker({ position, className, type }) {
  return (
    <IconMarker
      position={position}
      className={className}
      icon={{
        element: <Icon img={`icon-icon_${getIconImg(type)}`} />,
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
  type: PropTypes.oneOf(['from', 'via', 'to']),
};

LocationMarker.defaultProps = {
  type: 'via',
};
