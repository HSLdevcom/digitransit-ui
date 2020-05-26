import PropTypes from 'prop-types';
import React from 'react';
import Airplane from './assets/airplane.svg';
import Arrow from './assets/arrow.svg';
import Bus from './assets/bus.svg';
import Busstop from './assets/bus_stop.svg';
import City from './assets/city.svg';
import Edit from './assets/edit.svg';
import Ferry from './assets/ferry.svg';
import Home from './assets/home.svg';
import Locate from './assets/locate.svg';
import Place from './assets/place.svg';
import Rail from './assets/rail.svg';
import School from './assets/school.svg';
import Shopping from './assets/shopping.svg';
import Sport from './assets/sport.svg';
import Star from './assets/star.svg';
import Station from './assets/station.svg';
import Subway from './assets/subway.svg';
import Tram from './assets/tram.svg';
import Work from './assets/work.svg';
import Map from './assets/map.svg';
import Close from './assets/close.svg';
import Mapmarker from './assets/mapmarker.svg';
import MapmarkerVia from './assets/mapmarker-via.svg';
import Search from './assets/search.svg';
import Plus from './assets/plus.svg';
import Attention from './assets/attention.svg';
import Dropdown from './assets/dropdown.svg';
import Time from './assets/time.svg';
import Ellipsis from './assets/ellipsis.svg';
import DirectionB from './assets/direction_b.svg';
import Calendar from './assets/calendar.svg';

const IconMap = style => {
  return {
    airplane: <Airplane style={style} />,
    arrow: <Arrow style={style} />,
    bus: <Bus style={style} />,
    busstop: <Busstop style={style} />,
    city: <City style={style} />,
    edit: <Edit style={style} />,
    ferry: <Ferry style={style} />,
    home: <Home style={style} />,
    locate: <Locate style={style} />,
    map: <Map style={style} />,
    place: <Place style={style} />,
    rail: <Rail style={style} />,
    school: <School style={style} />,
    shopping: <Shopping style={style} />,
    sport: <Sport style={style} />,
    star: <Star style={style} />,
    station: <Station style={style} />,
    subway: <Subway style={style} />,
    tram: <Tram style={style} />,
    work: <Work style={style} />,
    close: <Close style={style} />,
    'mapMarker-via': <MapmarkerVia style={style} />,
    mapMarker: <Mapmarker style={style} />,
    search: <Search style={style} />,
    plus: <Plus style={style} />,
    attention: <Attention style={style} />,
    'arrow-dropdown': <Dropdown style={style} />,
    time: <Time style={style} />,
    ellipsis: <Ellipsis style={style} />,
    'direction-b': <DirectionB style={style} />,
    calendar: <Calendar style={style} />,
  };
};

/**
 * Icon renders predefined Svg icons as react component.
 * @example
 * <Icon
 *    img="bus"       // Key of svg, required
 *    height={1}      // Height as em, optional
 *    width={1}       // Width as em, optional
 *    color="#007ac9" // Color of image, optional
 *    rotate={90}     // How many degrees to rotate image, optional
 * />
 */
const Icon = ({ color, img, height, width, rotate }) => {
  const style = {
    fill: color || null,
    height: height ? `${height}em` : null,
    width: width ? `${width}em` : null,
    transform: rotate ? `rotate(${rotate}deg)` : null,
  };
  const icons = IconMap(style);
  return <span aria-hidden>{icons[img]}</span>;
};

Icon.propTypes = {
  color: PropTypes.string,
  height: PropTypes.number,
  img: PropTypes.string.isRequired,
  width: PropTypes.number,
  rotate: PropTypes.string,
};

Icon.defaultProps = {
  color: undefined,
  height: undefined,
  width: undefined,
  rotate: undefined,
};

export default Icon;
