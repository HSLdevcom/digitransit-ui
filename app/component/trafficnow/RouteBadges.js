/* eslint-disable no-underscore-dangle */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { entityShape } from '../../util/shapes';
import { useRoute } from '../../util/RouteContext';
import { useConfigContext } from '../../configurations/ConfigContext';
import { AlertEntityType } from '../../constants';
import { groupEntitiesByMode } from './utils';
import Icon from '../Icon';
import IconBackground from '../icon/IconBackground';

const STOP_SIGN_ICON_SCALE = 0.5;
const NORMAL_ICON_SCALE = 1;

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
        ([key, { mode, isRoute, entities }]) =>
          mode && (
            <div key={key} className={`route-badges-mode flex-row ${mode}`}>
              <Icon
                img={`icon_${mode}`}
                height={2}
                width={2}
                iconScale={isRoute ? NORMAL_ICON_SCALE : STOP_SIGN_ICON_SCALE}
                background={
                  !isRoute && (
                    <IconBackground shape="stopsign" color="currentcolor" />
                  )
                }
              />
              <div className="route-badges-mode-lines flex-row vertically-centered">
                {entities.map(({ id, name, url }) => (
                  <a key={id} onClick={handleRouteBadgeClick(url)} href={url}>
                    <span className="route-badges-mode-lines--text">
                      {name}
                    </span>
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
