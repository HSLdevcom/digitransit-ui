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
import ModeBusReplacement from './assets/bus-replacement.svg';
import ModeSpeedTram from './assets/speedtram.svg';
import ModeBusLocal from './assets/bus-local.svg';
import ModeRail from './assets/mode_rail.svg';
import ModeTram from './assets/mode_tram.svg';
import ModeFerry from './assets/mode_ferry.svg';
import ModeBikeRentalStation from './assets/mode_citybike.svg';
import ModeAirplane from './assets/mode_airplane.svg';
import ModeDigiTram from './assets/mode_digi_tram.svg';
import ModeDigiBikeRentalStation from './assets/mode_digi_citybike.svg';
import ModeDigiFunicular from './assets/mode_digi_funicular.svg';
import FutureRoute from './assets/icon-route.svg';
import Position from './assets/position.svg';
import SearchStreetName from './assets/search-streetname.svg';
import BusWaltti from './assets/bus-waltti.svg';
import FerryWaltti from './assets/ferry-waltti.svg';
import BikeRentalStationWaltti from './assets/citybike-waltti.svg';
import RailWaltti from './assets/rail-waltti.svg';
import TramWaltti from './assets/tram-waltti.svg';
import Check from './assets/check.svg';
import SearchBusStopDefault from './assets/search-bus-stop-default.svg';
import SearchBusStopExpressDefault from './assets/search-bus-stop-express-default.svg';
import SearchSpeedTramStopDefault from './assets/search-speedtram-stop-default.svg';
import SearchRailStopDefault from './assets/search-rail-stop-default.svg';
import SearchFerryDefault from './assets/search-ferry-default.svg';
import SearchFerryStopDefault from './assets/search-ferry-stop-default.svg';
import CityBikeRentalStationDefault from './assets/citybike-stop-default.svg';
import CityBikeRentalStationDefaultSecondary from './assets/citybike-stop-default-secondary.svg';
import SearchTramStopDefault from './assets/search-tram-stop-default.svg';
import CityBikeRentalStationDigitransit from './assets/citybike-stop-digitransit.svg';
import CityBikeRentalStationDigitransitSecondary from './assets/citybike-stop-digitransit-secondary.svg';
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

const iconMap = {
  airplane: Airplane,
  arrow: Arrow,
  bus: Bus,
  busstop: Busstop,
  caution: CautionWhite,
  city: City,
  citybike: CityBikeRentalStationDefault,
  edit: Edit,
  ferry: Ferry,
  home: Home,
  locate: Locate,
  map: Map,
  place: Place,
  rail: Rail,
  school: School,
  shopping: Shopping,
  sport: Sport,
  star: Star,
  station: Station,
  subway: Subway,
  tram: Tram,
  work: Work,
  close: Close,
  'mapMarker-via': MapmarkerVia,
  'bike-park': BikePark,
  'car-park': CarPark,
  mapMarker: Mapmarker,
  search: Search,
  plus: Plus,
  attention: Attention,
  'arrow-dropdown': Dropdown,
  time: Time,
  ellipsis: Ellipsis,
  opposite: Opposite,
  viapoint: Viapoint,
  calendar: Calendar,
  'select-from-map': SelectFromMap,
  'caution-white': CautionWhite,
  trash: Trash,
  'mode-bus': ModeBus,
  'mode-bus-express': ModeBusExpress,
  'mode-bus-local': ModeBusLocal,
  'mode-bus-replacement': ModeBusReplacement,
  'mode-speedtram': ModeSpeedTram,
  'mode-rail': ModeRail,
  'mode-tram': ModeTram,
  'mode-subway': Subway,
  'mode-ferry': ModeFerry,
  'mode-citybike': ModeBikeRentalStation,
  'mode-digitransit-bus': SearchBusStationDigitransit,
  'mode-digitransit-rail': SearchRailStationDigitransit,
  'mode-digitransit-ferry': SearchFerryDigitransit,
  'mode-digitransit-tram': ModeDigiTram,
  'mode-digitransit-citybike': ModeDigiBikeRentalStation,
  'mode-digitransit-airplane': ModeAirplane,
  'mode-digitransit-subway': Subway,
  'mode-digitransit-funicular': ModeDigiFunicular,
  'mode-waltti-bus': BusWaltti,
  'mode-waltti-citybike': BikeRentalStationWaltti,
  'mode-waltti-ferry': FerryWaltti,
  'mode-waltti-rail': RailWaltti,
  'mode-waltti-tram': TramWaltti,
  'future-route': FutureRoute,
  position: Position,
  'search-street-name': SearchStreetName,
  check: Check,
  'search-bus-stop-default': SearchBusStopDefault,
  'search-bus-stop-express-default': SearchBusStopExpressDefault,
  'search-speedtram-stop-default': SearchSpeedTramStopDefault,
  'search-rail-stop-default': SearchRailStopDefault,
  'search-ferry-default': SearchFerryDefault,
  'search-ferry-stop-default': SearchFerryStopDefault,
  'search-tram-stop-default': SearchTramStopDefault,
  'citybike-stop-digitransit': CityBikeRentalStationDigitransit,
  'citybike-stop-digitransit-secondary':
    CityBikeRentalStationDigitransitSecondary,
  'citybike-stop-default': CityBikeRentalStationDefault,
  'citybike-stop-default-secondary': CityBikeRentalStationDefaultSecondary,
  'search-airplane-digitransit': SearchAirplaneDigitransit,
  'search-bus-station-digitransit': SearchBusStationDigitransit,
  'search-bus-stop-digitransit': SearchBusStopDigitransit,
  'search-bustram-stop-digitransit': SearchBusTramStopDigitransit,
  'search-ferry-digitransit': SearchFerryDigitransit,
  'search-ferry-stop-digitransit': SearchFerryStopDigitransit,
  'search-funicular-stop-digitransit': ModeDigiFunicular,
  'search-rail-stop-digitransit': SearchRailStopDigitransit,
  'search-rail-station-digitransit': SearchRailStationDigitransit,
  'search-tram-stop-digitransit': SearchTramStopDigitransit,
  funicular: Funicular,
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

  const iconName =
    img === 'locate' && color && color.toUpperCase() !== '#007AC9'
      ? 'position'
      : img;

  const Component = iconMap[iconName] || SearchBusStopDigitransit;

  return <Component style={style} />;
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
