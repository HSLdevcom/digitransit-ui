import cx from 'classnames';
import capitalize from 'lodash/capitalize';
import { DateTime } from 'luxon';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import Link from 'found/Link';
import { configShape } from '../util/shapes';
import ExternalLink from './ExternalLink';
import Icon from './Icon';
import RouteNumber from './RouteNumber';
import ServiceAlertIcon from './ServiceAlertIcon';
import { routePagePath, stopPagePath, PREFIX_STOPS } from '../util/path';
import {
  entityCompare,
  getEntitiesOfType,
  mapAlertSource,
} from '../util/alertUtils';
import { AlertEntityType } from '../constants';
import { getRouteMode } from '../util/modeUtils';

/**
 * Returns a localized string representing a time period between startTime and endTime
 * @param {{currentTime: DateTime, startTime: DateTime, endTime: DateTime, intl: any}}
 * @returns {string} A formatted string representing the time period
 */
export const getTimePeriod = ({ currentTime, startTime, endTime, intl }) => {
  const at = intl.formatMessage({
    id: 'at-time',
  });
  const defaultFormat = `d.L.yyyy '${at}' HH:mm`;
  const diffBetween = startTime
    .startOf('day')
    .diff(currentTime.startOf('day'), 'days').days;

  let start;
  // if yesterday, today or tomorrow, format to localized relative time
  // else format to d.L.yyyy
  if (diffBetween >= -1 && diffBetween <= 1) {
    const relativeStart = startTime.toRelativeCalendar({ base: currentTime });
    start = `${relativeStart} ${at} ${startTime.toFormat('HH:mm')}`;
  } else {
    start = startTime.toFormat(defaultFormat);
  }

  if (!endTime) {
    return start;
  }
  let end;
  if (endTime.hasSame(startTime, 'day')) {
    end = endTime.toFormat('HH:mm');
  } else {
    end = endTime.toFormat(defaultFormat);
  }
  return `${capitalize(start)} - ${end}`;
};

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
    onClickLink,
  },
  { intl, config },
) {
  if (!description && !header) {
    return null;
  }

  const showTime = startTime && currentTime;
  const uniqueEntities =
    getEntitiesWithUniqueIdentifiers(entities).sort(entityCompare);
  const gtfsIdList = getGtfsIds(uniqueEntities);
  const entityIdentifiers = getEntityIdentifiers(uniqueEntities);

  const entityType =
    getEntitiesOfType(uniqueEntities, AlertEntityType.Stop).length > 0
      ? AlertEntityType.Stop
      : AlertEntityType.Route;

  const routeColor =
    entityType === AlertEntityType.Route && getColor(uniqueEntities);
  const routeMode =
    entityType === AlertEntityType.Route && getMode(uniqueEntities);

  const routeLinks =
    entityType === AlertEntityType.Route && entityIdentifiers && gtfsIdList
      ? entityIdentifiers.map((identifier, i) => (
          <Link
            onClick={e => {
              e.stopPropagation();
              onClickLink?.();
            }}
            key={`${gtfsIdList[i]}-${index}`}
            to={routePagePath(gtfsIdList[i], PREFIX_STOPS)}
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
    entityType === AlertEntityType.Stop && entityIdentifiers && gtfsIdList
      ? entityIdentifiers.map((identifier, i) => (
          <Link
            onClick={e => {
              e.stopPropagation();
              onClickLink?.();
            }}
            key={`${gtfsIdList[i]}-${index}`}
            to={stopPagePath(false, gtfsIdList[i])}
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
      {(entityType === AlertEntityType.Route && (
        <RouteNumber
          alertSeverityLevel={severityLevel}
          color={routeColor}
          mode={routeMode}
        />
      )) ||
        (entityType === AlertEntityType.Stop && (
          <div className="route-number">
            {severityLevel === 'INFO' ? (
              <Icon img="icon_info" className="stop-disruption info" />
            ) : (
              <Icon img="icon_caution" className="stop-disruption warning" />
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
            ((entityType === AlertEntityType.Route &&
              showLinks &&
              routeLinks.length > 0 && <>{routeLinks} </>) ||
              (!showLinks && (
                <div
                  className={cx('route-alert-entityid', routeMode)}
                  style={{ color: routeColor }}
                >
                  {entityIdentifiers.join(', ')}
                </div>
              )) ||
              (entityType === AlertEntityType.Stop &&
                showLinks &&
                stopLinks.length > 0 && <>{stopLinks} </>) ||
              (!showLinks && (
                <div className={routeMode}>{entityIdentifiers.join(' ')}</div>
              )))}
          {showTime && (
            <>
              {getTimePeriod({
                currentTime: DateTime.fromSeconds(currentTime),
                startTime: DateTime.fromSeconds(startTime),
                endTime: endTime ? DateTime.fromSeconds(endTime) : undefined,
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
  onClickLink: PropTypes.func,
};

AlertRow.contextTypes = {
  config: configShape.isRequired,
  intl: intlShape.isRequired,
};

AlertRow.defaultProps = {
  description: undefined,
  currentTime: DateTime.now().toSeconds(),
  endTime: undefined,
  severityLevel: undefined,
  startTime: undefined,
  feed: undefined,
  header: undefined,
  entities: undefined,
  url: undefined,
  showLinks: false,
  onClickLink: undefined,
};
