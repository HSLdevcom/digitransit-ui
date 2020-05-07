import PropTypes from 'prop-types';
import React from 'react';
import Close from './assets/close.svg';
import Mapmarker from './assets/mapmarker.svg';
import MapmarkerVia from './assets/mapmarker-via.svg';
import Search from './assets/search.svg';

const IconMap = style => {
  return {
    close: <Close style={style} />,
    'mapMarker-via': <MapmarkerVia style={style} />,
    mapMarker: <Mapmarker style={style} />,
    search: <Search style={style} />,
  };
};

function Icon({ color, img, height, width, margin }) {
  const style = {
    fill: color || null,
    height: height ? `${height}em` : null,
    width: width ? `${width}em` : null,
    marginRight: margin ? `${margin}em` : null,
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
};

Icon.defaultProps = {
  color: undefined,
  height: undefined,
  margin: undefined,
  width: undefined,
};

export default Icon;
