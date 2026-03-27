import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { intlShape } from 'react-intl';
import Link from 'found/Link';
import { configShape } from '../util/shapes';
import Icon from './Icon';
import { routePagePath, stopPagePath, PREFIX_STOPS } from '../util/path';
import { entityCompare, getEntitiesOfType } from '../util/alertUtils';
import { AlertEntityType } from '../constants';
import { getRouteMode } from '../util/modeUtils';
import Badge from './Badge';
import { useConfigContext } from '../configurations/ConfigContext';
import { useTranslationsContext } from '../util/useTranslationsContext';
import { groupEntitiesByMode } from './trafficnow/utils';
import { useRouter } from 'found';

const getColor = entities => {
  if (Array.isArray(entities)) {
    const routeEntities = getEntitiesOfType(entities, AlertEntityType.Route);
    return routeEntities.length > 0 && `#${routeEntities[0].color}`;
  }
  return null;
};

const getMode = entities => {
  if (Array.isArray(entities)) {
    const routeEntities = getEntitiesOfType(entities, AlertEntityType.Route);
    return routeEntities.length > 0 && getRouteMode(routeEntities[0]);
  }
  return 'bus';
};

const getGtfsIds = entities => entities?.map(entity => entity.gtfsId) || [];

const getEntityIdentifiers = entities =>
  entities
    ?.map(
      entity =>
        entity.shortName ||
        (entity.code ? `${entity.name} (${entity.code})` : entity.name),
    )
    .filter(identifier => identifier);

const getEntitiesWithUniqueIdentifiers = entities => {
  const entitiesByIdentifier = {};
  entities?.forEach(entity => {
    entitiesByIdentifier[
      entity.shortName ||
        (entity.code ? `${entity.name} (${entity.code})` : entity.name)
    ] = entity;
  });
  return Object.values(entitiesByIdentifier);
};

export default function Disruption({
  toggleDetails,
  showLinks,
  index,
  alertDescriptionText,
  alertEffect,
  entities,
  feed,
  alertHeaderText,
  alertSeverityLevel,
  alertUrl,
  id,
}) {
  const config = useConfigContext();
  const { match } = useRouter();

  if (!alertDescriptionText && !alertHeaderText) {
    return null;
  }

  const uniqueEntities =
    getEntitiesWithUniqueIdentifiers(entities).sort(entityCompare);
  const gtfsIdList = getGtfsIds(uniqueEntities);
  const entityIdentifiers = getEntityIdentifiers(uniqueEntities);

  const entityType =
    getEntitiesOfType(uniqueEntities, AlertEntityType.Stop).length > 0
      ? AlertEntityType.Stop
      : AlertEntityType.Route;

  const entitiesByMode = groupEntitiesByMode(entities, config);
  return (
    <div>
      <div className="alert-row" role="listitem">
        <button onClick={() => toggleDetails(id)} className="alert-row-arrow">
          <Icon
            img="icon_arrow-collapse--right"
            color={config.colors.primary}
          ></Icon>
        </button>
        <div className="alert-row-top">
          <Badge showIcon variant={alertSeverityLevel} label={alertEffect} />
        </div>
        <div className="alert-row-badges">
          {Object.entries(entitiesByMode).map(
            ([key, { mode, isRoute, entities }]) => {
              return (
                <>
                  <Icon
                    img={`icon_${mode === 'bus-express' ? 'bus' : mode}`}
                    className={`${mode}`}
                    height={2}
                    width={2}
                  />
                  <span className="route-badge-lines">
                    {entities.map(({ url, id, name }) => (
                      <a
                        href={url}
                        key={id}
                        onClick={e => {
                          e.preventDefault();
                          match.router.push(url);
                        }}
                      >
                        <span>{name}</span>
                      </a>
                    ))}
                  </span>
                </>
              );
            },
          )}
        </div>
        <div className="alert-row-bottom">
          <span className="alert-row-title">{alertHeaderText}</span>
        </div>
      </div>
    </div>
  );
}

Disruption.propTypes = {
  currentTime: PropTypes.number,
  index: PropTypes.number.isRequired,
  showLinks: PropTypes.bool,
  alertDescriptionText: PropTypes.string,
  alertEffect: PropTypes.string,
  entities: PropTypes.arrayOf(
    PropTypes.shape({
      __typename: PropTypes.string.isRequired,
      gtfsId: PropTypes.string.isRequired,
    }),
  ),
  alertSeverityLevel: PropTypes.string,
  alertUrl: PropTypes.string,
  alertHeaderText: PropTypes.string,
  feed: PropTypes.string,
};
