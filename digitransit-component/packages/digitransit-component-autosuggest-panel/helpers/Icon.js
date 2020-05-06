import React from 'react';
import PropTypes from 'prop-types';
import Plus from './assets/plus.svg';
import Attention from './assets/attention.svg';
import Dropdown from './assets/dropdown.svg';
import Close from './assets/close.svg';
import Time from './assets/time.svg';
import Ellipsis from './assets/ellipsis.svg';
import DirectionB from './assets/direction_b.svg';

const IconMap = style => {
  return {
    plus: <Plus style={style} />,
    attention: <Attention style={style} />,
    'arrow-dropdown': <Dropdown style={style} />,
    close: <Close style={style} />,
    time: <Time style={style} />,
    ellipsis: <Ellipsis style={style} />,
    'direction-b': <DirectionB style={style} />,
  };
};

function Icon({ color, img, height, width, margin, rotate }) {
  const style = {
    fill: color || null,
    height: height ? `${height}em` : null,
    width: width ? `${width}em` : null,
    marginRight: margin ? `${margin}em` : null,
    transform: rotate ? `rotate(${rotate}deg)` : null,
  };
  const icons = IconMap(style);
  return <span aria-hidden>{icons[img]}</span>;
}

Icon.propTypes = {
  color: PropTypes.string,
  height: PropTypes.number,
  img: PropTypes.string.isRequired,
  margin: PropTypes.number,
  width: PropTypes.number,
  rotate: PropTypes.number,
};

Icon.defaultProps = {
  color: undefined,
  height: undefined,
  margin: undefined,
  width: undefined,
  rotate: undefined,
};

export default Icon;
