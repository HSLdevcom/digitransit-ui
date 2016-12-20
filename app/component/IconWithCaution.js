import React from 'react';
import cx from 'classnames';
import ComponentUsageExample from './ComponentUsageExample';

const IconWithCaution = props => (
  <svg id={props.id} viewBox="0 0 40 40" className={cx('icon', props.className)}>
    <use
      xlinkHref={`#${props.img}`}
    />
    <use
      xlinkHref="#icon-icon_caution"
      transform="scale(0.6,0.6)"
      y="30"
      style={{ color: 'white', fill: 'red' }}
    />
  </svg>
);

IconWithCaution.description = () =>
  <ComponentUsageExample description="Bus with caution">
    <IconWithCaution className="bus" img={'icon-icon_bus'} />
  </ComponentUsageExample>;

IconWithCaution.displayName = 'IconWithCaution';

IconWithCaution.propTypes = {
  id: React.PropTypes.string,
  className: React.PropTypes.string,
  img: React.PropTypes.string.isRequired,
};

export default IconWithCaution;
