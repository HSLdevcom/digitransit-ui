import PropTypes from 'prop-types';
import React from 'react';
import Arrow from './assets/arrow.svg';
import Check from './assets/check.svg';
import City from './assets/city.svg';
import Edit from './assets/edit.svg';
import Home from './assets/home.svg';
import Locate from './assets/locate.svg';
import Place from './assets/place.svg';
import School from './assets/school.svg';
import Shopping from './assets/shopping.svg';
import Sport from './assets/sport.svg';
import Star from './assets/star.svg';
import Station from './assets/station.svg';
import Work from './assets/work.svg';
import Map from './assets/map.svg';
import Close from './assets/close.svg';
import Mapmarker from './assets/mapmarker.svg';
import Search from './assets/search.svg';
import Plus from './assets/plus.svg';
import Attention from './assets/attention.svg';
import Dropdown from './assets/dropdown.svg';
import CarPark from './assets/carpark.svg';
import BikePark from './assets/bikepark.svg';
import Time from './assets/time.svg';
import Ellipsis from './assets/ellipsis.svg';
import Opposite from './assets/opposite.svg';
import Viapoint from './assets/viapoint.svg';
import Calendar from './assets/calendar.svg';
import CautionWhite from './assets/caution_white_exclamation.svg';
import Trash from './assets/trash.svg';
import FutureRoute from './assets/icon-route.svg';
import Position from './assets/position.svg';
import SearchStreetName from './assets/search-streetname.svg';
import Airplane from './assets/airplane.svg';
import Subway from './assets/subway.svg';
import Funicular from './assets/funicular.svg';
import FunicularStop from './assets/funicular-stop.svg';
import BusHsl from './assets/bus-hsl.svg';
import BusReplacementHsl from './assets/bus-replacement-hsl.svg';
import SpeedTramHsl from './assets/speedtram-hsl.svg';
import BusLocalHsl from './assets/bus-local-hsl.svg';
import RailHsl from './assets/rail-hsl.svg';
import TramHsl from './assets/tram-hsl.svg';
import CityBikeHsl from './assets/citybike-hsl.svg';
import FerryHsl from './assets/ferry-hsl.svg';
import BusStopHsl from './assets/bus-stop-hsl.svg';
import SpeedTramStopHsl from './assets/speedtram-stop-hsl.svg';
import RailStopHsl from './assets/rail-stop-hsl.svg';
import FerryStopHsl from './assets/ferry-stop-hsl.svg';
import CityBikeStopHsl from './assets/citybike-stop-hsl.svg';
import CityBikeStopHslSecondary from './assets/citybike-stop-hsl-secondary.svg';
import TramStopHsl from './assets/tram-stop-hsl.svg';
import CityBikeDigitransit from './assets/citybike-digitransit.svg';
import BusDigitransit from './assets/bus-digitransit.svg';
import FerryDigitransit from './assets/ferry-digitransit.svg';
import RailDigitransit from './assets/rail-digitransit.svg';
import TramDigitransit from './assets/tram-digitransit.svg';
import BusStopDigitransit from './assets/bus-stop-digitransit.svg';
import CityBikeStopDigitransit from './assets/citybike-stop-digitransit.svg';
import CityBikeStopDigitransitSecondary from './assets/citybike-stop-digitransit-secondary.svg';
import FerryStopDigitransit from './assets/ferry-stop-digitransit.svg';
import RailStopDigitransit from './assets/rail-stop-digitransit.svg';
import TramStopDigitransit from './assets/tram-stop-digitransit.svg';
import BusTramStopDigitransit from './assets/bustram-stop-digitransit.svg';
import BusFillDigitransit from './assets/bus-fill-digitransit.svg';
import CityBikeFillDigitransit from './assets/citybike-fill-digitransit.svg';
import FerryFillDigitransit from './assets/ferry-fill-digitransit.svg';
import RailFillDigitransit from './assets/rail-fill-digitransit.svg';
import TramFillDigitransit from './assets/tram-fill-digitransit.svg';
import CarParkFill from './assets/carpark-fill.svg';
import BikeParkFill from './assets/bikepark-fill.svg';

export const defaultColors = {
  primary: '#0074bf',
  accessiblePrimary: '#0074be',
  hover: '#0062a1',
  caution: '#dc0451',
  airplane: '#0046ad',
  bus: '#007ac9',
  'bus-express': '#ca4000',
  'bus-local': '#007ac9',
  'replacement-bus': '#dc0451',
  rail: '#8c4799',
  tram: '#008151',
  speedtram: '#007e79',
  subway: '#ed8c00',
  ferry: '#007a97',
  'ferry-external': '#666666',
  funicular: '#ff00ff',
  citybike: '#f2b62d',
  'citybike-secondary': '#333333',
  bikepark: '#f2b62d',
  carpark: '#007ac9',
};

const iconMap = {
  arrow: Arrow,
  caution: CautionWhite,
  city: City,
  citybike: CityBikeHsl,
  edit: Edit,
  home: Home,
  locate: Locate,
  map: Map,
  place: Place,
  school: School,
  shopping: Shopping,
  sport: Sport,
  star: Star,
  station: Station,
  work: Work,
  close: Close,
  bikepark: BikePark,
  carpark: CarPark,
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
  'caution-white': CautionWhite,
  trash: Trash,
  position: Position,
  'search-street-name': SearchStreetName,
  'future-route': FutureRoute,
  check: Check,
  // shared transport modes
  airplane: Airplane,
  subway: Subway,
  funicular: Funicular,
  'funicular-stop': FunicularStop,
  // HSL
  'bus-hsl': BusHsl,
  'bus-local-hsl': BusLocalHsl,
  'replacement-bus-hsl': BusReplacementHsl,
  'ferry-hsl': FerryHsl,
  'rail-hsl': RailHsl,
  'speedtram-hsl': SpeedTramHsl,
  'tram-hsl': TramHsl,
  'citybike-hsl': CityBikeHsl,
  'bus-stop-hsl': BusStopHsl,
  'speedtram-stop-hsl': SpeedTramStopHsl,
  'rail-stop-hsl': RailStopHsl,
  'ferry-stop-hsl': FerryStopHsl,
  'tram-stop-hsl': TramStopHsl,
  'citybike-stop-hsl': CityBikeStopHsl,
  'citybike-stop-hsl-secondary': CityBikeStopHslSecondary,
  // digitransit
  'bus-digitransit': BusDigitransit,
  'ferry-digitransit': FerryDigitransit,
  'rail-digitransit': RailDigitransit,
  'tram-digitransit': TramDigitransit,
  'citybike-digitransit': CityBikeDigitransit,
  'citybike-stop-digitransit': CityBikeStopDigitransit,
  'citybike-stop-digitransit-secondary': CityBikeStopDigitransitSecondary,
  'bus-stop-digitransit': BusStopDigitransit,
  'bustram-stop-digitransit': BusTramStopDigitransit,
  'ferry-stop-digitransit': FerryStopDigitransit,
  'rail-stop-digitransit': RailStopDigitransit,
  'tram-stop-digitransit': TramStopDigitransit,
  'bus-fill-digitransit': BusFillDigitransit,
  'citybike-fill-digitransit': CityBikeFillDigitransit,
  'ferry-fill-digitransit': FerryFillDigitransit,
  'rail-fill-digitransit': RailFillDigitransit,
  'tram-fill-digitransit': TramFillDigitransit,
  // no theme binding
  'bikepark-fill': BikeParkFill,
  'carpark-fill': CarParkFill,
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

  const Component = iconMap[iconName] || BusStopDigitransit;

  return <Component style={style} />;
};

Icon.propTypes = {
  img: PropTypes.string.isRequired,
  color: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  rotate: PropTypes.string,
};

Icon.defaultProps = {
  color: undefined,
  width: undefined,
  height: undefined,
  rotate: undefined,
};

export default Icon;
