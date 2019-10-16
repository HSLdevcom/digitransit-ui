import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Icon from '../Icon';
import IconMarker from './IconMarker';

const getValidType = type => {
  switch (type) {
    case 'from':
      return 'from';
    case 'to':
      return 'to';
    case 'via':
    default:
      return 'via';
  }
};

export default function LocationMarker({ position, className, isLarge, type }) {
  const validType = getValidType(type);
  const sideLength = isLarge ? 30 : 24;
  return (
    <IconMarker
      position={position}
      className={cx(validType, className)}
      icon={{
        className: cx(validType, className),
        element: <Icon img={`icon-icon_mapMarker-${validType}-map`} />,
        iconAnchor: [sideLength / 2, sideLength],
        iconSize: [sideLength, sideLength],
      }}
    />
  );
}

LocationMarker.propTypes = {
  position: IconMarker.propTypes.position,
  className: PropTypes.string,
  isLarge: PropTypes.bool,
  type: PropTypes.oneOf(['from', 'via', 'to']),
};

LocationMarker.defaultProps = {
  className: undefined,
  isLarge: false,
  type: 'via',
};
