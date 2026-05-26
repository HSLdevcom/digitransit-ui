/* eslint-disable no-underscore-dangle */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { entityShape } from '../../util/shapes';
import { useConfigContext } from '../../configurations/ConfigContext';
import { AlertEntityType } from '../../constants';
import { groupEntitiesByMode } from './utils';
import { useFilterContext } from './filters/FiltersContext';
import RouteBadgeGroup from './components/RouteBadgeGroup';

export default function RouteBadges({ entities: rawEntities }) {
  const config = useConfigContext();
  const { selectedFilters } = useFilterContext();

  if (rawEntities.every(e => e.__typename === AlertEntityType.Unknown)) {
    return null;
  }

  const entitiesByMode = useMemo(
    () => groupEntitiesByMode(rawEntities, config),
    [rawEntities, config],
  );

  return (
    <div className="badges">
      {Object.entries(entitiesByMode).map(
        ([key, { mode, isRoute, entities }]) =>
          mode && (
            <RouteBadgeGroup
              key={key}
              mode={mode}
              routes={entities.map(({ id, name, url, gtfsId }) => ({
                id,
                name,
                url,
                gtfsId,
              }))}
              isStop={!isRoute}
              highlightedGtfsId={selectedFilters.entity?.gtfsId}
            />
          ),
      )}
    </div>
  );
}

RouteBadges.propTypes = {
  entities: PropTypes.arrayOf(entityShape).isRequired,
};
