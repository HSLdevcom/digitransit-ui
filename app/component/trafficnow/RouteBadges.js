/* eslint-disable no-underscore-dangle */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { entityShape } from '../../util/shapes';
import Icon from '../Icon';
import { useRoute } from '../../util/RouteContext';
import { useConfigContext } from '../../configurations/ConfigContext';
import { getRouteMode } from '../../util/modeUtils';

const UNKNOWN_ENTITY_TYPE = 'Unknown';

/**
 * Extracts routes from entities, groups them by their mode and
 * ensures each route (by id) appears only once per mode.
 * @param {Array} entities - a list of alert related entities
 * @param {Object} config - contains information about possible extended travel modes
 * @returns {Object} { [mode]: [{ id, shortName }] }
 */
function groupRoutesByMode(entities, config) {
  return entities.reduce((acc, entity) => {
    let routes = [];
    switch (entity.__typename) {
      case 'Stop':
        routes = Array.isArray(entity.routes) ? entity.routes : [];
        break;
      case 'Route':
        routes = [entity];
        break;
      case 'StopOnRoute':
        routes = entity.route ? [entity.route] : [];
        break;
      default:
        break;
    }

    routes.forEach(route => {
      if (route && route.id && route.shortName && route.mode) {
        const mode = getRouteMode(route, config);
        if (!acc[mode]) {
          acc[mode] = new Map();
        }
        acc[mode].set(route.id, {
          id: route.id,
          shortName: route.shortName,
          gtfsId: route.gtfsId,
        });
      }
    });

    return acc;
  }, {});
}

/**
 * Returns an array of unique routes by shortName.
 * @param {Map} routesMap
 * @returns {Array} [{ id, shortName }]
 */
function getUniqueShortNameRoutes(routesMap) {
  return Array.from(
    Array.from(routesMap.values())
      .reduce((acc, route) => {
        if (!acc.has(route.shortName)) {
          acc.set(route.shortName, route);
        }
        return acc;
      }, new Map())
      .values(),
  );
}
export default function RouteBadges({ entities }) {
  const { match } = useRoute();
  const config = useConfigContext();

  const handleRouteBadgeClick = url => e => {
    e.preventDefault();
    match.router.push(url);
  };

  if (entities.every(e => e.__typename === UNKNOWN_ENTITY_TYPE)) {
    return null;
  }

  const routesByMode = useMemo(
    () => groupRoutesByMode(entities, config),
    [entities, config],
  );

  return (
    <div className="route-badges">
      {Object.entries(routesByMode).map(([mode, routesMap]) => {
        const uniqueRoutes = getUniqueShortNameRoutes(routesMap);
        return (
          <div className={`route-badges-mode flex-row ${mode}`} key={mode}>
            <Icon img={`icon_${mode}`} height={2} width={2} />
            <div className="route-badges-mode-lines flex-row vertically-centered">
              {uniqueRoutes.map(({ id, shortName, gtfsId }) => (
                <a
                  key={id}
                  onClick={handleRouteBadgeClick(`/linjat/${gtfsId}`)}
                  href={`/linjat/${gtfsId}`}
                >
                  <span className="route-badges-mode-lines--text">
                    {shortName}
                  </span>
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

RouteBadges.propTypes = {
  entities: PropTypes.arrayOf(entityShape).isRequired,
};
RouteBadges.defaultProps = {};
