/* eslint-disable no-underscore-dangle */
import {
  getTransportModes,
  getRouteMode,
  getBaseTransportMode,
} from '../../util/modeUtils';
import {
  AlertEntityType,
  LocationTypes,
  TrafficNowTransportModes,
} from '../../constants';
import { stopPagePath, routePagePath } from '../../util/path';

const sortAlphaNumeric = (a, b) => {
  const first = typeof a === 'string' ? a.toLowerCase() : a.toString();
  const second = typeof b === 'string' ? b.toLowerCase() : b.toString();

  return first.localeCompare(second);
};

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
      gtfsId,
      isStop,
      isStation,
    });
    acc[key].ids.add(id);
  }
};

const groupEntitiesByMode = (entities, config) => {
  const grouped = entities
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

  Object.values(grouped).forEach(group => {
    group.entities.sort((a, b) => sortAlphaNumeric(a.name, b.name));
  });

  return grouped;
};

const getAvailableModes = config =>
  Object.entries(getTransportModes(config)).reduce((acc, [k, v]) => {
    if (
      v.availableForSelection &&
      TrafficNowTransportModes.includes(k.toUpperCase())
    ) {
      acc.push(k.toUpperCase());
    }
    return acc;
  }, []);

// Returns the distinct transport modes that should get their own card for an
// alert. If the alert has any route information, only the modes with routes are
// returned (stops are shown only in the drill-down view). Stop-only modes are
// returned only when the alert has no routes at all. Modes keep their
// first-seen order.
// selectedFilters.entity / selectedFilters.favourites narrow modes to only
// those whose entity group contains the relevant route or stop.
const getAlertModes = (entities, config, selectedFilters = {}) => {
  if (!entities) {
    return [];
  }
  const { entity, favourites } = selectedFilters;
  const routeModes = [];
  const stopModes = [];
  Object.values(groupEntitiesByMode(entities, config)).forEach(
    ({ mode, isRoute, entities: groupEntities }) => {
      if (!mode) {
        return;
      }
      if (entity && !groupEntities.some(e => e.gtfsId === entity.gtfsId)) {
        return;
      }
      if (favourites && !groupEntities.some(e => favourites.has(e.gtfsId))) {
        return;
      }
      const target = isRoute ? routeModes : stopModes;
      if (!target.includes(mode)) {
        target.push(mode);
      }
    },
  );
  return routeModes.length > 0 ? routeModes : stopModes;
};

// Splits each alert into one card per affected transport mode, respecting
// active filters (vehicleModes, entity, favourites). Alerts with no recognised
// mode produce a single card with mode=undefined.
const buildDisruptionCards = (disruptions, selectedFilters, config) =>
  disruptions.flatMap(alert => {
    const allModes = getAlertModes(alert.entities, config, selectedFilters);
    if (allModes.length === 0) {
      return [{ key: alert.id, alert, mode: undefined }];
    }
    const vehicleModes = selectedFilters.vehicleModes ?? [];
    const modes =
      vehicleModes.length > 0
        ? allModes.filter(m =>
            vehicleModes.includes(getBaseTransportMode(m.toLowerCase())),
          )
        : allModes;
    return modes.map(mode => ({
      key: `${alert.id}-${mode}`,
      alert,
      mode,
    }));
  });

// Sort routes by shortName, favourites, search entity
const sortRoutes = (routes, favRoutes, highlightedGtfsId) =>
  routes
    .slice()
    .sort((a, b) => `${a.route.shortName}`.localeCompare(b.route.shortName))
    .sort(
      (a, b) =>
        Number(favRoutes.includes(b.route.gtfsId)) -
        Number(favRoutes.includes(a.route.gtfsId)),
    )
    .sort(
      (a, b) =>
        Number(b.route.gtfsId === highlightedGtfsId) -
        Number(a.route.gtfsId === highlightedGtfsId),
    );

export {
  getAvailableModes,
  groupEntitiesByMode,
  getAlertModes,
  buildDisruptionCards,
  sortRoutes,
};
