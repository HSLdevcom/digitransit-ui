import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import plus from './assets/plus.svg';
import attention from './assets/attention.svg';
import dropdown from './assets/dropdown.svg';
import close from './assets/close.svg';
import time from './assets/time.svg';
import ellipsis from './assets/ellipsis.svg';
import directionB from './assets/direction_b.svg';

const IconMap = {
  plus,
  attention,
  'arrow-dropdown': dropdown,
  close,
  time,
  ellipsis,
  'direction-b': directionB,
};

function Icon({ className, color, img, height, width, margin }) {
  return (
    <span aria-hidden className="icon-container">
      <svg
        className={cx('icon', className)}
        style={{
          fill: color || null,
          height: height ? `${height}em` : null,
          width: width ? `${width}em` : null,
          marginRight: margin ? `${margin}em` : null,
        }}
      >
        <use xlinkHref={`${IconMap[img]}#icon`} />
      </svg>
    </span>
  );
}

Icon.propTypes = {
  className: PropTypes.string,
  color: PropTypes.string,
  height: PropTypes.number,
  img: PropTypes.string.isRequired,
  margin: PropTypes.number,
  width: PropTypes.number,
};

Icon.defaultProps = {
  color: undefined,
  height: undefined,
  margin: undefined,
  width: undefined,
};

export default Icon;
