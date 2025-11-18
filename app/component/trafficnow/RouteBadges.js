/* eslint-disable no-underscore-dangle */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { entityShape } from '../../util/shapes';
import Icon from '../Icon';
import { useRoute } from '../../util/RouteContext';
import { useConfigContext } from '../../configurations/ConfigContext';
import { AlertEntityType } from '../../constants';
import { groupEntitiesByMode } from './utils';

export default function RouteBadges({ entities: rawEntities }) {
  const { match } = useRoute();
  const config = useConfigContext();

  const handleRouteBadgeClick = url => e => {
    e.preventDefault();
    match.router.push(url);
  };

  if (rawEntities.every(e => e.__typename === AlertEntityType.Unknown)) {
    return null;
  }

  const entitiesByMode = useMemo(
    () => groupEntitiesByMode(rawEntities, config),
    [rawEntities, config],
  );

  return (
    <div className="route-badges">
      {Object.entries(entitiesByMode).map(
        ([key, { mode, isRoute, entities }]) => (
          <div key={key} className={`route-badges-mode flex-row ${mode}`}>
            <Icon
              backgroundShape={isRoute ? undefined : 'stopsign'}
              backgroundColor="currentcolor"
              img={`icon_${mode}`}
              height={2}
              width={2}
            />
            <div className="route-badges-mode-lines flex-row vertically-centered">
              {entities.map(({ id, name, url }) => (
                <a key={id} onClick={handleRouteBadgeClick(url)} href={url}>
                  <span className="route-badges-mode-lines--text">{name}</span>
                </a>
              ))}
            </div>
          </div>
        ),
      )}
    </div>
  );
}

RouteBadges.propTypes = {
  entities: PropTypes.arrayOf(entityShape).isRequired,
};
RouteBadges.defaultProps = {};
