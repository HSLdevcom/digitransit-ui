import PropTypes from 'prop-types';
import React from 'react';
import Arrow from './assets/arrow.svg';
import Home from './assets/home.svg';
import Plus from './assets/plus.svg';
import Work from './assets/work.svg';

const IconMap = style => {
  return {
    arrow: <Arrow style={style} />,
    home: <Home style={style} />,
    plus: <Plus style={style} />,
    work: <Work style={style} />,
  };
};

function Icon({ className, color, img, height, width, margin, rotate }) {
  const style = {
    fill: color || null,
    height: height ? `${height}em` : null,
    width: width ? `${width}em` : null,
    marginRight: margin ? `${margin}em` : null,
    transform: rotate ? `rotate(${rotate}deg)` : null,
  };
  const icons = IconMap(style);
  return (
    <span className={className} aria-hidden>
      {icons[img]}
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
  rotate: PropTypes.string,
};

Icon.defaultProps = {
  className: undefined,
  color: undefined,
  height: undefined,
  margin: undefined,
  width: undefined,
  rotate: undefined,
};

export default Icon;
