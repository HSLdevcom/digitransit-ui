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
import CarPark from './assets/car-park.svg';
import BikePark from './assets/bike-park.svg';
import Time from './assets/time.svg';
import Ellipsis from './assets/ellipsis.svg';
import Opposite from './assets/opposite.svg';
import Viapoint from './assets/viapoint.svg';
import Calendar from './assets/calendar.svg';
import SelectFromMap from './assets/select-from-map.svg';
import CautionWhite from './assets/caution_white_exclamation.svg';
import Trash from './assets/trash.svg';
import ModeBus from './assets/mode_bus.svg';
import ModeBusExpress from './assets/bus-express.svg';
import ModeBusLocal from './assets/bus-local.svg';
import ModeRail from './assets/mode_rail.svg';
import ModeTram from './assets/mode_tram.svg';
import ModeFerry from './assets/mode_ferry.svg';
import ModeCitybike from './assets/mode_citybike.svg';
import ModeAirplane from './assets/mode_airplane.svg';
import ModeDigiTram from './assets/mode_digi_tram.svg';
import ModeDigiCitybike from './assets/mode_digi_citybike.svg';
import ModeDigiFunicular from './assets/mode_digi_funicular.svg';
import FutureRoute from './assets/icon-route.svg';
import Position from './assets/position.svg';
import SearchStreetName from './assets/search-streetname.svg';
import BusWaltti from './assets/bus-waltti.svg';
import FerryWaltti from './assets/ferry-waltti.svg';
import CitybikeWaltti from './assets/citybike-waltti.svg';
import RailWaltti from './assets/rail-waltti.svg';
import TramWaltti from './assets/tram-waltti.svg';
import Check from './assets/check.svg';
import SearchBusStopDefault from './assets/search-bus-stop-default.svg';
import SearchBusStopExpressDefault from './assets/search-bus-stop-express-default.svg';
import SearchRailStopDefault from './assets/search-rail-stop-default.svg';
import SearchFerryDefault from './assets/search-ferry-default.svg';
import SearchFerryStopDefault from './assets/search-ferry-stop-default.svg';
import CityBikeStopDefault from './assets/citybike-stop-default.svg';
import CityBikeStopDefaultSecondary from './assets/citybike-stop-default-secondary.svg';
import SearchTramStopDefault from './assets/search-tram-stop-default.svg';
import CityBikeStopDigitransit from './assets/citybike-stop-digitransit.svg';
import CityBikeStopDigitransitSecondary from './assets/citybike-stop-digitransit-secondary.svg';
import SearchAirplaneDigitransit from './assets/search-airplane-digitransit.svg';
import SearchBusStationDigitransit from './assets/search-bus-station-digitransit.svg';
import SearchBusStopDigitransit from './assets/search-bus-stop-digitransit.svg';
import SearchBusTramStopDigitransit from './assets/search-bustram-stop-digitransit.svg';
import SearchFerryDigitransit from './assets/search-ferry-digitransit.svg';
import SearchFerryStopDigitransit from './assets/search-ferry-stop-digitransit.svg';
import SearchRailStopDigitransit from './assets/search-rail-stop-digitransit.svg';
import SearchRailStationDigitransit from './assets/search-rail-station-digitransit.svg';
import SearchTramStopDigitransit from './assets/search-tram-stop-digitransit.svg';
import Funicular from './assets/funicular.svg';

const IconMap = style => {
  return {
    airplane: <Airplane style={style} />,
    arrow: <Arrow style={style} />,
    bus: <Bus style={style} />,
    busstop: <Busstop style={style} />,
    caution: <CautionWhite style={style} />,
    city: <City style={style} />,
    citybike: <CityBikeStopDefault style={style} />,
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
    'bike-park': <BikePark style={style} />,
    'car-park': <CarPark style={style} />,
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
    'mode-bus-express': <ModeBusExpress style={style} />,
    'mode-bus-local': <ModeBusLocal style={style} />,
    'mode-rail': <ModeRail style={style} />,
    'mode-tram': <ModeTram style={style} />,
    'mode-subway': <Subway style={style} />,
    'mode-ferry': <ModeFerry style={style} />,
    'mode-citybike': <ModeCitybike style={style} />,
    'mode-digitransit-bus': <SearchBusStationDigitransit style={style} />,
    'mode-digitransit-rail': <SearchRailStationDigitransit style={style} />,
    'mode-digitransit-ferry': <SearchFerryDigitransit style={style} />,
    'mode-digitransit-tram': <ModeDigiTram style={style} />,
    'mode-digitransit-citybike': <ModeDigiCitybike style={style} />,
    'mode-digitransit-airplane': <ModeAirplane style={style} />,
    'mode-digitransit-subway': <Subway style={style} />,
    'mode-digitransit-funicular': <ModeDigiFunicular style={style} />,
    'mode-waltti-bus': <BusWaltti style={style} />,
    'mode-waltti-citybike': <CitybikeWaltti style={style} />,
    'mode-waltti-ferry': <FerryWaltti style={style} />,
    'mode-waltti-rail': <RailWaltti style={style} />,
    'mode-waltti-tram': <TramWaltti style={style} />,
    'future-route': <FutureRoute style={style} />,
    position: <Position style={style} />,
    'search-street-name': <SearchStreetName style={style} />,
    check: <Check style={style} />,
    'search-bus-stop-default': <SearchBusStopDefault style={style} />,
    'search-bus-stop-express-default': (
      <SearchBusStopExpressDefault style={style} />
    ),
    'search-rail-stop-default': <SearchRailStopDefault style={style} />,
    'search-ferry-default': <SearchFerryDefault style={style} />,
    'search-ferry-stop-default': <SearchFerryStopDefault style={style} />,
    'search-tram-stop-default': <SearchTramStopDefault style={style} />,
    'citybike-stop-digitransit': <CityBikeStopDigitransit style={style} />,
    'citybike-stop-digitransit-secondary': (
      <CityBikeStopDigitransitSecondary style={style} />
    ),
    'citybike-stop-default': <CityBikeStopDefault style={style} />,
    'citybike-stop-default-secondary': (
      <CityBikeStopDefaultSecondary style={style} />
    ),
    'search-airplane-digitransit': <SearchAirplaneDigitransit style={style} />,
    'search-bus-station-digitransit': (
      <SearchBusStationDigitransit style={style} />
    ),
    'search-bus-stop-digitransit': <SearchBusStopDigitransit style={style} />,
    'search-bustram-stop-digitransit': (
      <SearchBusTramStopDigitransit style={style} />
    ),
    'search-ferry-digitransit': <SearchFerryDigitransit style={style} />,
    'search-ferry-stop-digitransit': (
      <SearchFerryStopDigitransit style={style} />
    ),
    'search-funicular-stop-digitransit': <ModeDigiFunicular style={style} />,
    'search-rail-stop-digitransit': <SearchRailStopDigitransit style={style} />,
    'search-rail-station-digitransit': (
      <SearchRailStationDigitransit style={style} />
    ),
    'search-tram-stop-digitransit': <SearchTramStopDigitransit style={style} />,
    funicular: <Funicular style={style} />,
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
