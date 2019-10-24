import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import ComponentUsageExample from './ComponentUsageExample';

const getFontSize = length => {
  switch (length) {
    case 1:
      return '15px';
    case 2:
      return '14px';
    case 3:
      return '12px';
    case 4:
      return '10px';
    case 5:
      return '9px';
    default:
      return '11px';
  }
};

const IconWithTail = ({
  className,
  id,
  img,
  rotate,
  children,
  desaturate = false,
  scrollIntoView = false,
  allVehicles = false,
  vehicleNumber,
  useLargeIcon = false,
}) => (
  <span>
    {allVehicles && (
      <svg
        id={id}
        viewBox="0 0 24 24"
        className={cx(
          'allVehicles',
          `${useLargeIcon ? 'large-icon' : ''}`,
          className,
        )}
        ref={el => scrollIntoView && el && el.scrollIntoView()}
      >
        {useLargeIcon && (
          <React.Fragment>
            {rotate !== undefined && (
              <use
                filter={desaturate ? 'url(#desaturate)' : undefined}
                xlinkHref="#icon-icon_all-vehicles-shadow"
                transform={`rotate(${rotate} 12 12)`}
              />
            )}
            <use
              filter={desaturate ? 'url(#desaturate)' : undefined}
              xlinkHref={`#${img}`}
              transform="scale(1.2)"
            />
            <text
              textAnchor="middle"
              fontSize={getFontSize(vehicleNumber.length)}
              fontStyle="condensed"
              fontWeight="bold"
              fill="#FFF"
              transform="scale(0.34)"
            >
              <tspan x="35" y="41">
                {vehicleNumber}
              </tspan>
            </text>
          </React.Fragment>
        )}
        {!useLargeIcon && (
          <React.Fragment>
            {rotate !== undefined && (
              <use
                filter={desaturate ? 'url(#desaturate)' : undefined}
                xlinkHref={`#${img}`}
                transform={`rotate(${180 + rotate} 12 12)`}
              />
            )}
            {rotate === undefined && (
              <use
                filter={desaturate ? 'url(#desaturate)' : undefined}
                xlinkHref="#icon-icon_all-vehicles-large"
                transform="translate(5 5) scale(0.7)"
              />
            )}
          </React.Fragment>
        )}
        {children}
      </svg>
    )}
    {!allVehicles && (
      <svg
        id={id}
        viewBox="0 0 80 80"
        className={cx('icon', 'tail-icon', className)}
        ref={el => scrollIntoView && el && el.scrollIntoView()}
      >
        {rotate !== undefined && (
          <use
            filter={desaturate ? 'url(#desaturate)' : undefined}
            xlinkHref="#icon-icon_vehicle-live-shadow"
            transform={`rotate(${rotate} 40 40)`}
          />
        )}
        <use
          filter={desaturate ? 'url(#desaturate)' : undefined}
          xlinkHref={`#${img}`}
          transform="translate(26 26) scale(0.35)"
        />
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
      <IconWithTail img="icon-icon_bus-live" rotate={0} />
    </ComponentUsageExample>
    <ComponentUsageExample description="Rotate 90">
      <IconWithTail img="icon-icon_bus-live" rotate={90} />
    </ComponentUsageExample>
    <ComponentUsageExample description="Rotate 90, desaturated">
      <IconWithTail desaturate img="icon-icon_bus-live" rotate={90} />
    </ComponentUsageExample>
    <ComponentUsageExample description="no tail">
      <IconWithTail desaturate img="icon-icon_bus-live" />
    </ComponentUsageExample>
  </div>
);

IconWithTail.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  img: PropTypes.string.isRequired,
  rotate: PropTypes.number,
  children: PropTypes.element,
  desaturate: PropTypes.bool,
  scrollIntoView: PropTypes.bool,
  allVehicles: PropTypes.bool,
  vehicleNumber: PropTypes.string,
  useLargeIcon: PropTypes.bool,
};

export default IconWithTail;
