import React from 'react';
import cx from 'classnames';

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
      style={{ color: 'red', fill: 'red' }}
    />
  </svg>
);

IconWithBigCaution.displayName = 'IconWithCaution';

IconWithBigCaution.propTypes = {
  id: React.PropTypes.string,
  className: React.PropTypes.string,
  img: React.PropTypes.string.isRequired,
};

export default IconWithBigCaution;
