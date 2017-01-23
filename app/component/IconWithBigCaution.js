import React from 'react';
import cx from 'classnames';
import ComponentUsageExample from './ComponentUsageExample';

const IconWithBigCaution = props => (
  <svg id={props.id} viewBox="0 0 40 40" className={cx('icon', props.className)}>
    <use
      transform="scale(0.9,0.9)"
      x="5"
      xlinkHref={`#${props.img}`}
    />
    <use
      xlinkHref="#icon-icon_caution"
      transform="scale(0.7,0.7)"
      y="20"
      style={{ color: 'white', fill: 'red' }}
    />
  </svg>
);

IconWithBigCaution.displayName = 'IconWithBigCaution';


IconWithBigCaution.description = () =>
  <ComponentUsageExample description="Bus with caution">
    <IconWithBigCaution className="bus" img={'icon-icon_bus'} />
  </ComponentUsageExample>;


IconWithBigCaution.propTypes = {
  id: React.PropTypes.string,
  className: React.PropTypes.string,
  img: React.PropTypes.string.isRequired,
};

export default IconWithBigCaution;
