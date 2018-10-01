import PropTypes from 'prop-types';
import React from 'react';
import IconMarker from './IconMarker';
import Icon from '../Icon';

const getIconImg = (noText, type) => {
  if (noText) {
    return 'place';
  }
  switch (type) {
    case 'from':
      return 'mapMarker-from';
    case 'via':
      return 'mapMarker-via';
    case 'to':
      return 'mapMarker-to';
    default:
      return 'mapMarker-point';
  }
};

export default function LocationMarker({ position, className, noText, type }) {
  return (
    <IconMarker
      position={position}
      className={className}
      icon={{
        element: <Icon img={`icon-icon_${getIconImg(noText, type)}`} />,
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
  type: PropTypes.oneOf(['from', 'via', 'to']),
};

LocationMarker.defaultProps = {
  type: undefined,
};
