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

const IconWithTail = ({
  className,
  id,
  rotate,
  children,
  mode = 'bus',
  desaturate = false,
  scrollIntoView = false,
  vehicleNumber = '',
  useLargeIcon = false,
}) => (
  <span>
    {useLargeIcon ? (
      <svg
        id={id}
        viewBox="0 0 80 80"
        className={cx('icon', 'tail-icon', 'large-icon', className, mode)}
        ref={el => scrollIntoView && el && el.scrollIntoView()}
      >
        <g transform={`rotate(${(rotate || 0) + 180} 40 40)`}>
          <use
            xlinkHref="#icon-icon_vehicle-live-marker"
            transform="translate(24 24) scale(1.3)"
          />
        </g>
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
        className={cx('allVehicles', className)}
        ref={el => scrollIntoView && el && el.scrollIntoView()}
      >
        <React.Fragment>
          <use
            filter={desaturate ? 'url(#desaturate)' : undefined}
            xlinkHref="#icon-icon_all-vehicles-small"
            transform="translate(5 5) scale(0.7)"
          />
        </React.Fragment>
        {children}
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
  children: PropTypes.element,
  desaturate: PropTypes.bool,
  scrollIntoView: PropTypes.bool,
  vehicleNumber: PropTypes.string,
  useLargeIcon: PropTypes.bool,
};

export default IconWithTail;
