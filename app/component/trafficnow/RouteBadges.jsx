/* eslint-disable no-underscore-dangle */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { entityShape } from '../../util/shapes';
import { useConfigContext } from '../../configurations/ConfigContext';
import { AlertEntityType } from '../../constants';
import { groupEntitiesByMode } from './utils';
import { useFilterContext } from './filters/FiltersContext';
import RouteBadgeGroup from './components/RouteBadgeGroup';
import EntityBadge from './components/EntityBadge';

export default function RouteBadges({
  entities: rawEntities,
  compact = false,
  mode = undefined,
}) {
  const config = useConfigContext();
  const intl = useIntl();
  const { selectedFilters } = useFilterContext();

  const entitiesByMode = useMemo(
    () => groupEntitiesByMode(rawEntities, config),
    [rawEntities, config],
  );

  if (rawEntities.every(e => e.__typename === AlertEntityType.Unknown)) {
    return null;
  }

  const groups = Object.entries(entitiesByMode);

  // Overview cards are mode-specific.
  const modeGroups = mode
    ? groups.filter(([, group]) => group.mode === mode)
    : groups;

  // Do not show stops together with routes on compact overview cards.
  // Stop-only disruptions still get their own card.
  const routeGroups = compact
    ? modeGroups.filter(([, group]) => group.isRoute)
    : [];

  const visibleGroups = routeGroups.length > 0 ? routeGroups : modeGroups;

  return (
    <div className="badges">
      {visibleGroups.map(([key, { mode: groupMode, isRoute, entities }]) => {
        if (!groupMode) {
          return null;
        }
        const visibleEntities = compact
          ? entities.slice(0, config.trafficNowMaxRoutesPerCard)
          : entities;
        const hiddenCount = entities.length - visibleEntities.length;
        return (
          <RouteBadgeGroup
            key={key}
            stopPropagation
            mode={groupMode}
            routes={visibleEntities.map(({ id, name, url, gtfsId }) => ({
              id,
              name,
              url,
              gtfsId,
            }))}
            isStop={!isRoute}
            highlightedGtfsId={selectedFilters.entity?.gtfsId}
            renderSuffix={
              hiddenCount > 0 ? (
                <EntityBadge
                  entity={{ name: `+${hiddenCount}` }}
                  mode={groupMode}
                  ariaLabel={intl.formatMessage(
                    { id: 'traffic-now_more-routes' },
                    { count: hiddenCount },
                  )}
                />
              ) : null
            }
          />
        );
      })}
    </div>
  );
}

RouteBadges.propTypes = {
  entities: PropTypes.arrayOf(entityShape).isRequired,
  compact: PropTypes.bool,
  mode: PropTypes.string,
};
