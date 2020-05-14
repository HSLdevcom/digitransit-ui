import PropTypes from 'prop-types';
import React from 'react';
import Airplane from './assets/airplane.svg';
import Arrow from './assets/arrow.svg';
import Bus from './assets/bus.svg';
import Busstop from './assets/bus_stop.svg';
import City from './assets/city.svg';
import Ferry from './assets/ferry.svg';
import Locate from './assets/locate.svg';
import Place from './assets/place.svg';
import Rail from './assets/rail.svg';
import Star from './assets/star.svg';
import Station from './assets/station.svg';
import Subway from './assets/subway.svg';
import Tram from './assets/tram.svg';
import Map from './assets/map.svg';

const IconMap = style => {
  return {
    Airplane: <Airplane style={style} />,
    Arrow: <Arrow style={style} />,
    Bus: <Bus style={style} />,
    Busstop: <Busstop style={style} />,
    City: <City style={style} />,
    Ferry: <Ferry style={style} />,
    Locate: <Locate style={style} />,
    Place: <Place style={style} />,
    Rail: <Rail style={style} />,
    Star: <Star style={style} />,
    Station: <Station style={style} />,
    Subway: <Subway style={style} />,
    Tram: <Tram style={style} />,
    Map: <Map style={style} />,
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
