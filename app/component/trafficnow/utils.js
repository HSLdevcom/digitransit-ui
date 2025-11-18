/* eslint-disable no-underscore-dangle */
import { getRouteMode } from '../../util/modeUtils';
import { LocationTypes } from '../../constants';
import { PREFIX_ROUTES, PREFIX_TERMINALS, PREFIX_STOPS } from '../../util/path';

const PREFIX_BY_LOCATION_TYPE = {
  [LocationTypes.STOP]: PREFIX_STOPS,
  [LocationTypes.STATION]: PREFIX_TERMINALS,
  default: PREFIX_ROUTES,
};

const getUrlPrefix = locationType =>
  PREFIX_BY_LOCATION_TYPE[locationType] ?? PREFIX_BY_LOCATION_TYPE.default;

const addToModeGroup = (
  acc,
  {
    mode,
    id,
    shortName,
    name,
    gtfsId,
    locationType,
    isStop = false,
    isStation = false,
  },
) => {
  const url = `/${getUrlPrefix(locationType)}/${gtfsId}`;
  const key = `${mode}_${isStop || isStation ? 'stop' : 'route'}`;

  if (!acc[key]) {
    acc[key] = {
      mode,
      isRoute: !isStop && !isStation,
      entities: [],
    };
  }
  acc[key].entities.push({
    id,
    name: shortName || name,
    url,
    isStop,
    isStation,
  });
};

const groupEntitiesByMode = (entities, config) => {
  const group = entities
    .filter(e => e.__typename !== 'Unknown')
    .reduce((acc, e) => {
      if (!e.route && !e.stop) {
        addToModeGroup(acc, {
          ...e,
          mode: getRouteMode(e, config) || e.vehicleMode?.toLowerCase(),
          isStop: !!e.locationType,
          isStation: e.locationType === LocationTypes.STATION,
        });
        return acc;
      }

      if (e.route) {
        addToModeGroup(acc, {
          ...e.route,
          mode: getRouteMode(e.route, config),
        });
      }
      if (e.stop) {
        addToModeGroup(acc, {
          ...e.stop,
          mode: e.vehicleMode?.toLowerCase(),
          isStop: true,
          isStation: e.locationType === LocationTypes.STATION,
        });
      }
      return acc;
    }, {});
  return group;
};

export { groupEntitiesByMode };
