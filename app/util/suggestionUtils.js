import memoize from 'lodash/memoize';
import { getNameLabel } from '@digitransit-search-util/digitransit-search-util-uniq-by-label';

memoize.Cache = Map;

export const getStopCode = ({ id, code }) => {
  if (code) {
    return code;
  }
  if (
    id === undefined ||
    typeof id.indexOf === 'undefined' ||
    id.indexOf('#') === -1
  ) {
    return undefined;
  }
  // id from pelias
  return id.substring(id.indexOf('#') + 1);
};

export const getGTFSId = ({ id, gtfsId }) => {
  console.log(id)
  if (gtfsId) {
    return gtfsId;
  }

  if (id && typeof id.indexOf === 'function' && id.indexOf('GTFS:') === 0) {
    if (id.indexOf('#') === -1) {
      return id.substring(5);
    }
    return id.substring(5, id.indexOf('#'));
  }

  return undefined;
};

export const isStop = ({ layer }) =>
  layer === 'stop' || layer === 'favouriteStop';

export const isTerminal = ({ layer }) =>
  layer === 'station' || layer === 'favouriteStation';

export function getLabel(properties) {
  const parts = getNameLabel(properties, true);

  switch (properties.layer) {
    case 'currentPosition':
      return parts[1] || parts[0];
    case 'favouritePlace':
      return parts[0];
    default:
      return parts.length > 1 && parts[1] !== ''
        ? parts.join(', ')
        : parts[1] || parts[0];
  }
}

export function suggestionToAriaContent(item, intl, useTransportIcons) {
  let iconstr;
  if (item.properties.mode && useTransportIcons) {
    iconstr = `icon-icon_${item.mode}`;
  } else {
    const layer = item.properties.layer.replace('route-', '').toLowerCase();
    iconstr = intl.formatMessage({
      id: layer,
      defaultMessage: layer,
    });
  }
  const [name, label] = getNameLabel(item.properties, true);
  return [iconstr, name, label];
}

export function getIcon(layer) {
  const layerIcon = new Map([
    ['currentPosition', 'icon-icon_locate'],
    ['favouritePlace', 'icon-icon_star'],
    ['favouriteRoute', 'icon-icon_star'],
    ['favouriteStop', 'icon-icon_star'],
    ['favouriteStation', 'icon-icon_star'],
    ['favourite', 'icon-icon_star'],
    ['address', 'icon-icon_place'],
    ['stop', 'icon-icon_bus-stop'],
    ['locality', 'icon-icon_city'],
    ['station', 'icon-icon_station'],
    ['localadmin', 'icon-icon_city'],
    ['neighbourhood', 'icon-icon_city'],
    ['route-BUS', 'icon-icon_bus-withoutBox'],
    ['route-TRAM', 'icon-icon_tram-withoutBox'],
    ['route-RAIL', 'icon-icon_rail-withoutBox'],
    ['route-SUBWAY', 'icon-icon_subway-withoutBox'],
    ['route-FERRY', 'icon-icon_ferry-withoutBox'],
    ['route-AIRPLANE', 'icon-icon_airplane-withoutBox'],
  ]);

  const defaultIcon = 'icon-icon_place';
  return layerIcon.get(layer) || defaultIcon;
}
