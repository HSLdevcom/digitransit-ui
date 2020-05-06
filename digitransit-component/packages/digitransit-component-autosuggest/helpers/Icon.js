import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import close from './assets/close.svg';
import mapmarkerFrom from './assets/mapmarker-from.svg';
import mapmarkerTo from './assets/mapmarker-to.svg';
import mapmarkerVia from './assets/mapmarker-via.svg';
import search from './assets/search.svg';

const IconMap = {
  close,
  'mapMarker-via': mapmarkerVia,
  'mapMarker-from': mapmarkerFrom,
  'mapMarker-to': mapmarkerTo,
  search,
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
  className: undefined,
  color: undefined,
  height: undefined,
  margin: undefined,
  width: undefined,
};

export default Icon;
