import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

const Icon = ({
  className,
  color,
  height,
  id,
  img,
  omitViewBox,
  viewBox,
  width,
  dataURI,
  ariaLabel,
  iconScale,
  background,
  foreground,
}) => (
  <span aria-hidden className="icon-container">
    <svg
      id={id}
      style={{
        color: color || null,
        fill: color || null,
        height: height ? `${height}em` : null,
        width: width ? `${width}em` : null,
        outline: 0,
      }}
      viewBox={!omitViewBox ? viewBox : null}
      className={cx('icon', className)}
      aria-label={ariaLabel}
    >
      {background}
      <g
        style={{
          fill: color || null,
          height: height ? `${height}em` : null,
          width: width ? `${width}em` : null,
          outline: 0,
          transformOrigin: 'center',
          transform: `scale(${iconScale})`,
        }}
      >
        {dataURI ? (
          <image href={dataURI} x={0} y={0} width="100%" height="100%" />
        ) : (
          <use xlinkHref={`#${img}`} />
        )}
      </g>
    </svg>
    {foreground}
  </span>
);

Icon.propTypes = {
  className: PropTypes.string,
  color: PropTypes.string,
  height: PropTypes.number,
  id: PropTypes.string,
  img: PropTypes.string.isRequired,
  omitViewBox: PropTypes.bool,
  viewBox: PropTypes.string,
  width: PropTypes.number,
  dataURI: PropTypes.string,
  ariaLabel: PropTypes.string,
  iconScale: PropTypes.number,
  background: PropTypes.node,
  foreground: PropTypes.node,
};

Icon.defaultProps = {
  className: undefined,
  color: undefined,
  height: undefined,
  id: undefined,
  omitViewBox: false,
  viewBox: '0 0 40 40',
  width: undefined,
  ariaLabel: '',
  dataURI: undefined,
  iconScale: 1,
  background: undefined,
  foreground: undefined,
};

Icon.displayName = 'Icon';
Icon.description = 'Shows an icon from the SVG sprite';

export default Icon;
