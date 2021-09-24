/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
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

export default function RouteAlertsRow(
  {
    color,
    currentTime,
    description,
    endTime,
    entityIdentifier,
    entityMode,
    entityType,
    expired,
    severityLevel,
    startTime,
    url,
    gtfsIds,
    showRouteNameLink,
    header,
  },
  { intl },
) {
  const showTime = startTime && endTime && currentTime;
  const gtfsIdList = gtfsIds ? gtfsIds.split(',') : [];

  const routeLinks =
    entityType === 'route' && entityIdentifier && gtfsIds
      ? entityIdentifier.split(',').map((identifier, i) => (
          <Link
            key={gtfsIdList[i]}
            to={`/${PREFIX_ROUTES}/${gtfsIdList[i]}/${PREFIX_STOPS}`}
            className={cx('route-alert-row-link', entityMode)}
            style={{ color }}
          >
            {' '}
            {identifier}
          </Link>
        ))
      : [];

  const stopLinks =
    entityType === 'stop' && entityIdentifier && gtfsIds
      ? entityIdentifier.split(',').map((identifier, i) => (
          <Link
            key={gtfsIdList[i]}
            to={`/${PREFIX_STOPS}/${gtfsIdList[i]}`}
            className={cx('route-alert-row-link', entityMode)}
          >
            {' '}
            {identifier}
          </Link>
        ))
      : [];

  const checkedUrl =
    url && (url.match(/^[a-zA-Z]+:\/\//) ? url : `http://${url}`);

  if (!description && !header) {
    return null;
  }

  let genericCancellation;
  if (!description && header) {
    const {
      headsign,
      routeMode,
      shortName,
      scheduledDepartureTime,
    } = header.props;
    const mode = intl.formatMessage({ id: routeMode.toLowerCase() });
    genericCancellation = intl.formatMessage(
      { id: 'generic-cancelation' },
      {
        mode,
        route: shortName,
        headsign,
        time: moment.unix(scheduledDepartureTime).format('HH:mm'),
      },
    );
  }
  return (
    <div
      className={cx('route-alert-row', { expired })}
      role="listitem"
      tabIndex={0}
    >
      {(entityType === 'route' && entityMode && (
        <RouteNumber
          alertSeverityLevel={severityLevel}
          color={color}
          mode={entityMode}
        />
      )) ||
        (entityType === 'stop' && (
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
      <div className="route-alert-contents">
        {(entityIdentifier || showTime) && (
          <div className="route-alert-top-row">
            {entityIdentifier &&
              ((entityType === 'route' &&
                showRouteNameLink &&
                routeLinks.length > 0 && <>{routeLinks} </>) ||
                (!showRouteNameLink && (
                  <div
                    className={cx('route-alert-entityid', entityMode)}
                    style={{ color }}
                  >
                    {entityIdentifier}{' '}
                  </div>
                )) ||
                (entityType === 'stop' &&
                  showRouteNameLink &&
                  stopLinks.length > 0 && <>{stopLinks} </>) ||
                (!showRouteNameLink && (
                  <div className={entityMode}>{entityIdentifier}</div>
                )))}
            {showTime && (
              <>
                {getTimePeriod({
                  currentTime: moment.unix(currentTime),
                  startTime: moment.unix(startTime),
                  endTime: description ? moment.unix(endTime) : undefined,
                  intl,
                })}
              </>
            )}
          </div>
        )}
        {(description || genericCancellation) && (
          <div className="route-alert-body">
            {description || genericCancellation}
            {url && (
              <ExternalLink className="route-alert-url" href={checkedUrl}>
                {intl.formatMessage({ id: 'extra-info' })}
              </ExternalLink>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

RouteAlertsRow.propTypes = {
  color: PropTypes.string,
  currentTime: PropTypes.number,
  description: PropTypes.string,
  endTime: PropTypes.number,
  entityIdentifier: PropTypes.string,
  entityMode: PropTypes.string,
  entityType: PropTypes.oneOf(['route', 'stop']),
  expired: PropTypes.bool,
  severityLevel: PropTypes.string,
  startTime: PropTypes.number,
  url: PropTypes.string,
  gtfsIds: PropTypes.string,
  showRouteNameLink: PropTypes.bool,
  header: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
};

RouteAlertsRow.contextTypes = {
  intl: intlShape.isRequired,
};

RouteAlertsRow.defaultProps = {
  currentTime: moment().unix(),
  endTime: undefined,
  expired: false,
  entityIdentifier: undefined,
  entityMode: undefined,
  entityType: 'route',
  severityLevel: undefined,
  startTime: undefined,
  header: undefined,
};
