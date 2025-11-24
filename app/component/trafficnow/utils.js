/* eslint-disable no-underscore-dangle */
import { getRouteMode } from '../../util/modeUtils';
import { AlertEntityType, LocationTypes } from '../../constants';
import { stopPagePath, routePagePath } from '../../util/path';

const addToModeGroup = (
  acc,
  { mode, id, shortName, name, gtfsId, isStop = false, isStation = false },
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
    .filter(e => e.__typename !== AlertEntityType.Unknown)
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
