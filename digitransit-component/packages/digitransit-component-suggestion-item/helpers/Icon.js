import PropTypes from 'prop-types';
import React from 'react';
import Airplane from './assets/airplane.svg';
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

const IconMap = {
  Airplane,
  Bus,
  Busstop,
  City,
  Ferry,
  Locate,
  Place,
  Rail,
  Star,
  Station,
  Subway,
  Tram,
};

function Icon({ color, img, height, width, margin }) {
  return (
    <span aria-hidden className="icon-container">
      <svg
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
