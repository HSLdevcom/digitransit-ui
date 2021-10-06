import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

const getFontSize = length => {
  switch (length) {
    case 1:
      return '19px';
    case 2:
      return '19px';
    case 3:
      return '16px';
    case 4:
      return '12px';
    case 5:
      return '9px';
    default:
      return '12px';
  }
};
const getTextOffSet = length => {
  switch (length) {
    case 1:
      return 12;
    case 2:
      return 12;
    case 3:
      return 11;
    case 4:
      return 11;
    case 5:
      return 10;
    default:
      return 12;
  }
};

const getSvgContent = (rotate, useLargeIcon) => {
  const transform = useLargeIcon
    ? 'translate(24 24) scale(1.3)'
    : 'translate(10 10) scale(0.7)';
  return rotate ? (
    <g transform={`rotate(${(rotate || 0) + 180} 40 40)`}>
      <use
        xlinkHref={
          useLargeIcon
            ? '#icon-icon_vehicle-live-marker'
            : '#icon-icon_all-vehicles-small'
        }
        transform={transform}
      />
    </g>
  ) : (
    <use
      xlinkHref={
        useLargeIcon
          ? '#icon-icon_vehicle-live-marker-without-direction'
          : '#icon-icon_all-vehicles-small-without-direction'
      }
      transform={transform}
    />
  );
};

const VehicleIcon = ({
  className,
  id,
  rotate,
  mode = 'bus',
  scrollIntoView = false,
  vehicleNumber = '',
  useLargeIcon = true,
  color,
}) => (
  <span>
    {useLargeIcon ? (
      <svg
        id={id}
        viewBox="0 0 80 80"
        style={{ color: color ? `#${color}` : null }}
        className={cx('icon', 'large-vehicle-icon', className, mode)}
        ref={el => scrollIntoView && el && el.scrollIntoView()}
      >
        {getSvgContent(rotate, useLargeIcon)}
        <text
          textAnchor="middle"
          fontSize={getFontSize(vehicleNumber.length)}
          fontStyle="condensed"
        >
          <tspan x="40" y={35 + getTextOffSet(vehicleNumber.length)}>
            {vehicleNumber}
          </tspan>
        </text>
      </svg>
    ) : (
      <svg
        id={id}
        viewBox="0 0 120 120"
        className={cx('icon', 'small-vehicle-icon', className)}
        ref={el => scrollIntoView && el && el.scrollIntoView()}
      >
        {getSvgContent(rotate, useLargeIcon)}
      </svg>
    )}
  </span>
);

VehicleIcon.displayName = 'VehicleIcon';

VehicleIcon.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  rotate: PropTypes.number,
  mode: PropTypes.string,
  scrollIntoView: PropTypes.bool,
  vehicleNumber: PropTypes.string,
  useLargeIcon: PropTypes.bool,
  color: PropTypes.string,
};

export default VehicleIcon;
