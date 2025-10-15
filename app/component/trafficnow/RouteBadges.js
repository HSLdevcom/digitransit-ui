import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { entityShape } from '../../util/shapes';
import Icon from '../Icon';
import { useConfigContext } from '../../configurations/ConfigContext';
/**
 * Extracts routes from entities, groups them by their mode and
 * ensures each route (by id) appears only once per mode.
 * @param {Array} entities
 * @returns {Object} { [mode]: [{ id, shortName }] }
 */
function groupRoutesByMode(entities) {
  return entities.reduce((acc, entity) => {
    let routes = [];
    // eslint-disable-next-line no-underscore-dangle
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
        if (!acc[route.mode]) {
          acc[route.mode] = new Map();
        }
        acc[route.mode].set(route.id, {
          id: route.id,
          shortName: route.shortName,
        });
      }
    });

    return acc;
  }, {});
}

export default function RouteBadges({ entities }) {
  const { colors } = useConfigContext();
  const routesByMode = useMemo(() => groupRoutesByMode(entities), [entities]);

  return (
    <div className="route-badges">
      {Object.entries(routesByMode).map(([mode, routesMap]) => (
        <div className="mode flex-row vertically-centered" key={mode}>
          <Icon
            img={`icon_${mode.toLowerCase()}`}
            height={2}
            width={2}
            color={colors.iconColors[`mode-${mode.toLowerCase()}`]}
          />
          <div className={`${mode.toLowerCase()}-lines lines-row`}>
            {[...routesMap.values()].map(({ id, shortName }) => (
              <span key={id}>{shortName}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

RouteBadges.propTypes = { entities: PropTypes.arrayOf(entityShape).isRequired };
RouteBadges.defaultProps = {};
