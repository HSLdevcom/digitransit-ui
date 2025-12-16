/* eslint-disable no-underscore-dangle */
import { getRouteMode } from '../../util/modeUtils';
import { AlertEntityType, LocationTypes } from '../../constants';
import { stopPagePath, routePagePath } from '../../util/path';

const getMode = (stopOrRoute, config) => {
  const routeMode = getRouteMode(stopOrRoute, config);
  if (routeMode) {
    return routeMode;
  }

  return stopOrRoute?.vehicleMode?.toLowerCase();
};

const addToModeGroup = (
  acc,
  {
    mode,
    id,
    shortName,
    name,
    gtfsId,
    platformCode,
    locationType,
    isStop = false,
    isStation = false,
  },
) => {
  const url =
    isStop || isStation
      ? stopPagePath(isStation, gtfsId)
      : routePagePath(gtfsId);
  const key = `${mode}_${isStop || isStation ? 'stop' : 'route'}`;

  if (!acc[key]) {
    acc[key] = {
      mode,
      isRoute: !isStop && !isStation,
      entities: [],
      ids: new Set(),
      platformCode,
      locationType,
    };
  }
  if (!acc[key].ids.has(id)) {
    acc[key].entities.push({
      id,
      name: shortName || name,
      url,
      isStop,
      isStation,
    });
    acc[key].ids.add(id);
  }
};

const groupEntitiesByMode = (entities, config) => {
  return entities
    .filter(e => e.__typename !== AlertEntityType.Unknown)
    .reduce((acc, e) => {
      if (!e.route && !e.stop) {
        addToModeGroup(acc, {
          ...e,
          mode: getMode(e, config),
          isStop: !!e.locationType,
          isStation: e.locationType === LocationTypes.STATION,
        });
        return acc;
      }

      if (e.route) {
        addToModeGroup(acc, {
          ...e.route,
          mode: getMode(e.route, config),
        });
      }
      if (e.stop) {
        addToModeGroup(acc, {
          ...e.stop,
          mode: getMode(e.stop, config),
          isStop: true,
          isStation: e.locationType === LocationTypes.STATION,
        });
      }
      return acc;
    }, {});
};

export { groupEntitiesByMode };
