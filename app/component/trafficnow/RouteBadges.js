/* eslint-disable no-underscore-dangle */
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { entityShape } from '../../util/shapes';
import { useRoute } from '../../util/RouteContext';
import { useConfigContext } from '../../configurations/ConfigContext';
import { AlertEntityType } from '../../constants';
import { groupEntitiesByMode } from './utils';
import Icon from '../Icon';
import IconBackground from '../icon/IconBackground';
import { useFilterContext } from './filters/FiltersContext';

const STOP_SIGN_ICON_SCALE = 0.5;
const NORMAL_ICON_SCALE = 1;

export default function RouteBadges({ entities: rawEntities }) {
  const { match } = useRoute();
  const config = useConfigContext();
  const { selectedFilters } = useFilterContext();

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
            <div
              key={key}
              className="route-badges-mode flex-row routes-s-narrow"
            >
              <Icon
                img={`icon_${mode}`}
                className={`${mode}`}
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
                {entities.map(({ id, name, url, gtfsId }) => (
                  <a
                    key={id}
                    onClick={handleRouteBadgeClick(url)}
                    href={url}
                    className={cx(mode, {
                      highlight: gtfsId === selectedFilters.entity?.gtfsId,
                    })}
                  >
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
