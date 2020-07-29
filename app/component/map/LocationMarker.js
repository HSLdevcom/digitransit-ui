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

export default function LocationMarker({
  position,
  className,
  isLarge,
  type,
  streetMode,
}) {
  const validType = getValidType(type);
  const sideLength = isLarge ? 30 : 24;
  const isOnFoot = streetMode === 'walk' || streetMode === 'bike';

  return (
    <>
      {isOnFoot && (
        <IconMarker
          position={position}
          className={cx('leg-foot', validType)}
          icon={{
            className: cx('leg-foot', validType),
            element: (
              <svg viewBox="0 0 20 20">
                <circle className="stop-halo" cx="10" cy="10" r="7" />
                <circle
                  className="stop"
                  cx="10"
                  cy="10"
                  r="7"
                  strokeWidth="3"
                  color="#666"
                />
              </svg>
            ),
            iconAnchor: [sideLength / 2, sideLength / 1.5],
            iconSize: [sideLength, sideLength],
          }}
        />
      )}
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
    </>
  );
}

LocationMarker.propTypes = {
  position: IconMarker.propTypes.position,
  className: PropTypes.string,
  isLarge: PropTypes.bool,
  type: PropTypes.oneOf(['from', 'via', 'to']),
  streetMode: PropTypes.string,
};

LocationMarker.defaultProps = {
  className: undefined,
  isLarge: false,
  type: 'via',
  streetMode: '',
};
