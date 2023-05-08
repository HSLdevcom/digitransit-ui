import cx from 'classnames';
import capitalize from 'lodash/capitalize';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import Link from 'found/Link';

import ExternalLink from './ExternalLink';
import Icon from './Icon';
import RouteNumber from './RouteNumber';
import ServiceAlertIcon from './ServiceAlertIcon';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../util/path';
import {
  entityCompare,
  getEntitiesOfType,
  mapAlertSource,
} from '../util/alertUtils';
import { getRouteMode } from '../util/modeUtils';

export const getTimePeriod = ({ currentTime, startTime, endTime, intl }) => {
  const at = intl.formatMessage({
    id: 'at-time',
  });
  const defaultFormat = `D.M.YYYY [${at}] HH:mm`;
  const start = capitalize(
    startTime.calendar(currentTime, {
      lastDay: `[${intl.formatMessage({ id: 'yesterday' })} ${at}] HH:mm`,
      sameDay: `[${intl.formatMessage({ id: 'today' })} ${at}] HH:mm`,
      nextDay: `[${intl.formatMessage({ id: 'tomorrow' })} ${at}] HH:mm`,
      lastWeek: defaultFormat,
      nextWeek: defaultFormat,
      sameElse: defaultFormat,
    }),
  );
  if (!endTime) {
    return start;
  }
  const end = endTime.calendar(startTime, {
    sameDay: 'HH:mm',
    nextDay: defaultFormat,
    nextWeek: defaultFormat,
    sameElse: defaultFormat,
  });
  return `${start} - ${end}`;
};

const getColor = entities => {
  if (Array.isArray(entities)) {
    const routeEntities = getEntitiesOfType(entities, 'Route');
    return routeEntities.length > 0 && `#${routeEntities[0].color}`;
  }
  return null;
};

const getMode = entities => {
  if (Array.isArray(entities)) {
    const routeEntities = getEntitiesOfType(entities, 'Route');
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

export default function AlertRow(
  {
    currentTime,
    description,
    endTime,
    entities,
    feed,
    header,
    severityLevel,
    showLinks,
    startTime,
    url,
    index,
  },
  { intl, config },
) {
  if (!description && !header) {
    return null;
  }

  const showTime = startTime && currentTime;
  const uniqueEntities = getEntitiesWithUniqueIdentifiers(entities).sort(
    entityCompare,
  );
  const gtfsIdList = getGtfsIds(uniqueEntities);
  const entityIdentifiers = getEntityIdentifiers(uniqueEntities);

  const entityType =
    getEntitiesOfType(uniqueEntities, 'Stop').length > 0 ? 'Stop' : 'Route';

  const routeColor = entityType === 'Route' && getColor(uniqueEntities);
  const routeMode = entityType === 'Route' && getMode(uniqueEntities);

  const routeLinks =
    entityType === 'Route' && entityIdentifiers && gtfsIdList
      ? entityIdentifiers.map((identifier, i) => (
          <Link
            onClick={e => {
              e.stopPropagation();
            }}
            key={`${gtfsIdList[i]}-${index}`}
            to={`/${PREFIX_ROUTES}/${gtfsIdList[i]}/${PREFIX_STOPS}`}
            className={cx('alert-row-link', routeMode)}
            style={{ color: routeColor }}
            aria-label={`${intl.formatMessage({
              id: 'route',
            })} ${identifier}`}
          >
            {identifier}
          </Link>
        ))
      : [];

  const stopLinks =
    entityType === 'Stop' && entityIdentifiers && gtfsIdList
      ? entityIdentifiers.map((identifier, i) => (
          <Link
            onClick={e => {
              e.stopPropagation();
            }}
            key={`${gtfsIdList[i]}-${index}`}
            to={`/${PREFIX_STOPS}/${gtfsIdList[i]}`}
            className={cx('alert-row-link', routeMode)}
            aria-label={`${intl.formatMessage({
              id: 'stop',
            })} ${identifier}`}
          >
            {identifier}
          </Link>
        ))
      : [];

  const checkedUrl =
    url && (url.match(/^[a-zA-Z]+:\/\//) ? url : `http://${url}`);

  return (
    <div className="alert-row" role="listitem">
      {(entityType === 'Route' && (
        <RouteNumber
          alertSeverityLevel={severityLevel}
          color={routeColor}
          mode={routeMode}
        />
      )) ||
        (entityType === 'Stop' && (
          <div className="route-number">
            {severityLevel === 'INFO' ? (
              <Icon img="icon-icon_info" className="stop-disruption info" />
            ) : (
              <Icon
                img="icon-icon_caution"
                className="stop-disruption warning"
              />
            )}
          </div>
        )) || (
          <div className="route-number">
            <ServiceAlertIcon severityLevel={severityLevel} />
          </div>
        )}
      <div className="alert-contents">
        {mapAlertSource(config, intl.locale, feed)}
        <div className="alert-top-row">
          {entityIdentifiers &&
            entityIdentifiers.length > 0 &&
            ((entityType === 'Route' && showLinks && routeLinks.length > 0 && (
              <>{routeLinks} </>
            )) ||
              (!showLinks && (
                <div
                  className={cx('route-alert-entityid', routeMode)}
                  style={{ color: routeColor }}
                >
                  {entityIdentifiers.join(', ')}{' '}
                </div>
              )) ||
              (entityType === 'Stop' && showLinks && stopLinks.length > 0 && (
                <>{stopLinks} </>
              )) ||
              (!showLinks && (
                <div className={routeMode}>{entityIdentifiers.join(' ')}</div>
              )))}
          {showTime && (
            <>
              {getTimePeriod({
                currentTime: moment.unix(currentTime),
                startTime: moment.unix(startTime),
                endTime: endTime ? moment.unix(endTime) : undefined,
                intl,
              })}
            </>
          )}
        </div>
        {description && (
          <div className="alert-body">
            {description}
            {url && (
              <ExternalLink className="alert-url" href={checkedUrl}>
                {intl.formatMessage({ id: 'extra-info' })}
              </ExternalLink>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

AlertRow.propTypes = {
  currentTime: PropTypes.number,
  description: PropTypes.string,
  endTime: PropTypes.number,
  entities: PropTypes.arrayOf(
    PropTypes.shape({
      __typename: PropTypes.string.isRequired,
      gtfsId: PropTypes.string.isRequired,
    }),
  ),
  severityLevel: PropTypes.string,
  startTime: PropTypes.number,
  url: PropTypes.string,
  showLinks: PropTypes.bool,
  header: PropTypes.string,
  feed: PropTypes.string,
  index: PropTypes.number.isRequired,
};

AlertRow.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

AlertRow.defaultProps = {
  currentTime: moment().unix(),
  endTime: undefined,
  severityLevel: undefined,
  startTime: undefined,
  header: undefined,
};
