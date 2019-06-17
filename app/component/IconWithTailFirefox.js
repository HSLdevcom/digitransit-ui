import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import ComponentUsageExample from './ComponentUsageExample';

const IconWithTailFirefox = ({
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
        viewBox="0 0 80 80"
        className={cx('allVehicles',`${useLargeIcon ? 'large-icon' : ''}`,className,)}
        ref={el => scrollIntoView && el && el.scrollIntoView()}
      >
        {useLargeIcon && (
          <React.Fragment>
            {rotate !== undefined && (
              <use
                filter={desaturate ? 'url(#desaturate)' : undefined}
                xlinkHref="#icon-icon_all-vehicles-shadow"
                transform={`rotate(${rotate} 40 40)`}
              />
            )}
            <use
              filter={desaturate ? 'url(#desaturate)' : undefined}
              xlinkHref="#icon-icon_all-vehicles-large"
              transform="translate(24 0) scale(3.8)"
            />
            <text
              textAnchor="middle"
              fontSize={getFontSize(vehicleNumber.length)}
              fontStyle="condensed"
              fontWeight="bold"
              fill="#FFF"
            >
              <tspan x="41" y="44.5">
                {vehicleNumber}
              </tspan>
            </text>
          </React.Fragment>
        )}
        {!useLargeIcon && (
          <use
            filter={desaturate ? 'url(#desaturate)' : undefined}
            xlinkHref="#icon-icon_all-vehicles-small"
            transform={`rotate(${180 + rotate} 40 40) scale(3.5)`}
          />
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
          transform="translate(26 26) scale(0.35)  "
        />
      </svg>
    )}
  </span>
);

const getFontSize = length => {
  switch (length) {
    case 1:
      return '15px';
    case 2:
      return '15px';
    case 3:
      return '13px';
    case 4:
      return '11px';
    case 5:
      return '9px';
    default:
      return '11px';
  }
};

IconWithTailFirefox.displayName = 'IconWithTailFirefox';

IconWithTailFirefox.description = () => (
  <div>
    <p>Shows an icon from the SVG sprite and adds blue &lsquo;tail&rsquo;.</p>
    <ComponentUsageExample description="Rotate 0">
      <IconWithTailFirefox img="icon-icon_bus-live" rotate={0} />
    </ComponentUsageExample>
    <ComponentUsageExample description="Rotate 90">
      <IconWithTailFirefox img="icon-icon_bus-live" rotate={90} />
    </ComponentUsageExample>
    <ComponentUsageExample description="Rotate 90, desaturated">
      <IconWithTailFirefox desaturate img="icon-icon_bus-live" rotate={90} />
    </ComponentUsageExample>
    <ComponentUsageExample description="no tail">
      <IconWithTailFirefox desaturate img="icon-icon_bus-live" />
    </ComponentUsageExample>
  </div>
);

IconWithTailFirefox.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  img: PropTypes.string.isRequired,
  rotate: PropTypes.number,
  children: PropTypes.element,
  desaturate: PropTypes.bool,
  scrollIntoView: PropTypes.bool,
};

export default IconWithTailFirefox;
