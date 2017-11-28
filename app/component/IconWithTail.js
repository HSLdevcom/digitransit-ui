import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import ComponentUsageExample from './ComponentUsageExample';

const IconWithTail = ({
  className,
  id,
  img,
  rotate,
  children,
  desaturate = false,
  scrollIntoView = false,
}) => (
  <span>
    <svg
      id={id}
      viewBox="0 0 80 80"
      className={cx('icon', 'tail-icon', className)}
      ref={el => scrollIntoView && el && el.scrollIntoView()}
    >
      {rotate !== undefined && (
        <use
          filter={desaturate && 'url(#desaturate)'}
          xlinkHref="#icon-icon_vehicle-live-shadow"
          transform={`rotate(${rotate} 40 40)`}
        />
      )}
      <use
        filter={desaturate && 'url(#desaturate)'}
        xlinkHref={`#${img}`}
        transform="translate(26 26) scale(0.35)  "
      />
      {children}
    </svg>
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
};

export default IconWithTail;
