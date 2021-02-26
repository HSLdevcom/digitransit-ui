import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import ComponentUsageExample from './ComponentUsageExample';

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
    : 'translate(5 5) scale(0.7)';
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

const IconWithTail = ({
  className,
  id,
  rotate,
  mode = 'bus',
  scrollIntoView = false,
  vehicleNumber = '',
  useLargeIcon = false,
}) => (
  <span>
    {useLargeIcon ? (
      <svg
        id={id}
        viewBox="0 0 80 80"
        className={cx('icon', 'tail-icon', className, mode)}
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
        viewBox="0 0 24 24"
        className={className}
        ref={el => scrollIntoView && el && el.scrollIntoView()}
      >
        {getSvgContent(rotate, useLargeIcon)}
      </svg>
    )}
  </span>
);

IconWithTail.displayName = 'IconWithTail';

IconWithTail.description = () => (
  <div>
    <p>Shows an icon from the SVG sprite and adds blue &lsquo;tail&rsquo;.</p>
    <ComponentUsageExample description="Rotate 0">
      <IconWithTail rotate={0} vehicleNumber="550" />
    </ComponentUsageExample>
    <ComponentUsageExample description="Rotate 90">
      <IconWithTail rotate={90} vehicleNumber="550" />
    </ComponentUsageExample>
  </div>
);

IconWithTail.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  rotate: PropTypes.number,
  mode: PropTypes.string,
  scrollIntoView: PropTypes.bool,
  vehicleNumber: PropTypes.string,
  useLargeIcon: PropTypes.bool,
};

export default IconWithTail;
