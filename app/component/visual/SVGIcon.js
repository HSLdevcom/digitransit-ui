import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

const SVGIcon = ({ id, color, viewBox, className, img }) => (
  <svg
    id={id}
    style={color && { fill: color }}
    viewBox={viewBox}
    className={cx('icon', className)}
  >
    <use xlinkHref={`#${img}`} />
  </svg>
);

SVGIcon.propTypes = {
  id: PropTypes.string,
  viewBox: PropTypes.string,
  color: PropTypes.string,
  className: PropTypes.string,
  img: PropTypes.string.isRequired,
};

SVGIcon.defaultProps = {
  id: 'icon',
  viewBox: '0 0 40 40',
};

SVGIcon.asString = (img, className, id) => `
    <svg
      ${id ? ` id=${id}` : ''}
      viewBox="0 0 40 40"
      class="${cx('icon', className)}"
    >
      <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#${img}"/>
    </svg>
`;

SVGIcon.displayName = 'SVGIcon';
SVGIcon.description = 'Shows an icon from the SVG sprite';
export default SVGIcon;
