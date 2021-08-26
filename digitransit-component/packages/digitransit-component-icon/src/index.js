import PropTypes from 'prop-types';
import React from 'react';
import Airplane from './assets/airplane.svg';
import Arrow from './assets/arrow.svg';
import Bus from './assets/bus.svg';
import Busstop from './assets/bus_stop.svg';
import City from './assets/city.svg';
import Citybike from './assets/citybike.svg';
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
import Opposite from './assets/opposite.svg';
import Viapoint from './assets/viapoint.svg';
import Calendar from './assets/calendar.svg';
import SelectFromMap from './assets/select-from-map.svg';
import CautionWhite from './assets/caution_white_exclamation.svg';
import Trash from './assets/trash.svg';
import ModeBus from './assets/mode_bus.svg';
import ModeRail from './assets/mode_rail.svg';
import ModeTram from './assets/mode_tram.svg';
import ModeFerry from './assets/mode_ferry.svg';
import ModeCitybike from './assets/mode_citybike.svg';
import ModeAirplane from './assets/mode_airplane.svg';
import FutureRoute from './assets/icon-route.svg';
import Position from './assets/position.svg';
import SearchStreetName from './assets/search-streetname.svg';
import BusWaltti from './assets/bus-waltti.svg';
import FerryWaltti from './assets/ferry-waltti.svg';
import CitybikeWaltti from './assets/citybike-waltti.svg';
import RailWaltti from './assets/rail-waltti.svg';
import TramWaltti from './assets/tram-waltti.svg';
import Check from './assets/check.svg';

const IconMap = style => {
  return {
    airplane: <Airplane style={style} />,
    arrow: <Arrow style={style} />,
    bus: <Bus style={style} />,
    busstop: <Busstop style={style} />,
    caution: <CautionWhite style={style} />,
    city: <City style={style} />,
    citybike: <Citybike style={style} />,
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
    opposite: <Opposite style={style} />,
    viapoint: <Viapoint style={style} />,
    calendar: <Calendar style={style} />,
    'select-from-map': <SelectFromMap style={style} />,
    'caution-white': <CautionWhite style={style} />,
    trash: <Trash style={style} />,
    'mode-bus': <ModeBus style={style} />,
    'mode-rail': <ModeRail style={style} />,
    'mode-tram': <ModeTram style={style} />,
    'mode-subway': <Subway style={style} />,
    'mode-ferry': <ModeFerry style={style} />,
    'mode-citybike': <ModeCitybike style={style} />,
    'mode-airplane': <ModeAirplane style={style} />,
    'future-route': <FutureRoute style={style} />,
    position: <Position style={style} />,
    'search-street-name': <SearchStreetName style={style} />,
    'bus-waltti': <BusWaltti style={style} />,
    'citybike-waltti': <CitybikeWaltti style={style} />,
    'ferry-waltti': <FerryWaltti style={style} />,
    'rail-waltti': <RailWaltti style={style} />,
    'tram-waltti': <TramWaltti style={style} />,
    check: <Check style={style} />,
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
  if (img === 'locate' && color && color.toUpperCase() !== '#007AC9') {
    return <React.Fragment>{icons.position}</React.Fragment>;
  }
  return <React.Fragment>{icons[img]}</React.Fragment>;
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
