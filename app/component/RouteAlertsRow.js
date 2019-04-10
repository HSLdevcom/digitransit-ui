import cx from 'classnames';
import capitalize from 'lodash/capitalize';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

import ComponentUsageExample from './ComponentUsageExample';
import RouteNumber from './RouteNumber';
import ServiceAlertIcon from './ServiceAlertIcon';
import { AlertSeverityLevelType } from '../constants';

export const getTimePeriod = ({ currentTime, startTime, endTime, intl }) => {
  const at = intl.formatMessage({
    id: 'at-time',
  });
  const defaultFormat = `D.M.YYYY [${at}] HH:mm`;
  return `${capitalize(
    startTime.calendar(currentTime, {
      lastDay: `[${intl.formatMessage({ id: 'yesterday' })} ${at}] HH:mm`,
      sameDay: `[${intl.formatMessage({ id: 'today' })} ${at}] HH:mm`,
      nextDay: `[${intl.formatMessage({ id: 'tomorrow' })} ${at}] HH:mm`,
      lastWeek: defaultFormat,
      nextWeek: defaultFormat,
      sameElse: defaultFormat,
    }),
  )} - ${endTime.calendar(startTime, {
    sameDay: 'HH:mm',
    nextDay: defaultFormat,
    nextWeek: defaultFormat,
    sameElse: defaultFormat,
  })}`;
};

export default function RouteAlertsRow(
  {
    header,
    description,
    routeMode,
    routeLine,
    expired,
    color,
    severityLevel,
    startTime,
    endTime,
    currentTime,
  },
  { intl },
) {
  const showTime =
    severityLevel &&
    severityLevel !== AlertSeverityLevelType.Info &&
    startTime &&
    endTime &&
    currentTime;
  return (
    <div className={cx('route-alert-row', { expired })}>
      {routeMode ? (
        <RouteNumber color={color} hasDisruption mode={routeMode} vertical />
      ) : (
        <div className="route-number">
          <ServiceAlertIcon severityLevel={severityLevel} />
        </div>
      )}
      <div className="route-alert-contents">
        {routeLine && <div className={routeMode}>{routeLine}</div>}
        {showTime && (
          <div className="route-alert-time-period">
            {getTimePeriod({
              currentTime: moment.unix(currentTime),
              startTime: moment.unix(startTime),
              endTime: moment.unix(endTime),
              intl,
            })}
          </div>
        )}
        {header && <div className="route-alert-header">{header}</div>}
        {description && <div className="route-alert-body">{description}</div>}
      </div>
    </div>
  );
}

RouteAlertsRow.propTypes = {
  header: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  description: PropTypes.string,
  routeMode: PropTypes.string,
  routeLine: PropTypes.string,
  expired: PropTypes.bool,
  color: PropTypes.string,
  severityLevel: PropTypes.string,
  startTime: PropTypes.number,
  endTime: PropTypes.number,
  currentTime: PropTypes.number,
};

RouteAlertsRow.contextTypes = {
  intl: intlShape.isRequired,
};

RouteAlertsRow.defaultProps = {
  currentTime: moment().unix(),
  endTime: undefined,
  expired: false,
  routeLine: undefined,
  routeMode: undefined,
  severityLevel: undefined,
  startTime: undefined,
};

RouteAlertsRow.description = () => (
  <div>
    <p>Display a disruption alert for a specific route.</p>
    <div className="route-alerts-list">
      <ComponentUsageExample description="Currently active disruption">
        <RouteAlertsRow
          header="Raitiolinja 2 - Myöhästyy"
          description={
            'Raitiolinjat: 2 Kaivopuiston suuntaan ja 3 Nordenskiöldinkadun ' +
            'suuntaan, myöhästyy. Syy: tekninen vika. Paikka: Kauppatori, Hakaniemi. ' +
            'Arvioitu kesto: 14:29 - 15:20.'
          }
          routeMode="tram"
          routeLine="2"
          expired={false}
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="Past disruption">
        <RouteAlertsRow
          header="Raitiolinja 2 - Myöhästyy"
          description={
            'Raitiolinjat: 2 Kaivopuiston suuntaan ja 3 Nordenskiöldinkadun ' +
            'suuntaan, myöhästyy. Syy: tekninen vika. Paikka: Kauppatori, Hakaniemi. ' +
            'Arvioitu kesto: 14:29 - 15:20.'
          }
          routeMode="tram"
          routeLine="2"
          expired
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="service alert, valid yesterday">
        <RouteAlertsRow
          currentTime={moment().unix()}
          startTime={moment()
            .add(-1, 'days')
            .startOf('day')
            .unix()}
          endTime={moment()
            .add(-1, 'days')
            .endOf('day')
            .unix()}
          header="Lähijunat välillä Pasila-Leppävaara peruttu"
          description="Suurin osa lähijunista välillä Pasila-Leppävaara on peruttu asetinlaitevian vuoksi"
          routeLine="Y, S, U, L, E, A"
          routeMode="rail"
          severityLevel="WARNING"
          expired
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="service alert, valid today">
        <RouteAlertsRow
          currentTime={moment().unix()}
          startTime={moment()
            .startOf('day')
            .unix()}
          endTime={moment()
            .endOf('day')
            .unix()}
          header="Lähijunat välillä Pasila-Leppävaara peruttu"
          description="Suurin osa lähijunista välillä Pasila-Leppävaara on peruttu asetinlaitevian vuoksi"
          routeLine="Y, S, U, L, E, A"
          routeMode="rail"
          severityLevel="WARNING"
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="service alert, valid tomorrow">
        <RouteAlertsRow
          currentTime={moment().unix()}
          startTime={moment()
            .add(1, 'day')
            .startOf('day')
            .unix()}
          endTime={moment()
            .add(1, 'day')
            .endOf('day')
            .unix()}
          header="Lähijunat välillä Pasila-Leppävaara peruttu"
          description="Suurin osa lähijunista välillä Pasila-Leppävaara on peruttu asetinlaitevian vuoksi"
          routeLine="Y, S, U, L, E, A"
          routeMode="rail"
          severityLevel="WARNING"
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="service alert, valid some day">
        <RouteAlertsRow
          currentTime={moment().unix()}
          startTime={moment()
            .add(20, 'days')
            .startOf('day')
            .add(8, 'hours')
            .add(37, 'minutes')
            .unix()}
          endTime={moment()
            .add(25, 'days')
            .endOf('day')
            .unix()}
          header="Lähijunat välillä Pasila-Leppävaara peruttu"
          description="Suurin osa lähijunista välillä Pasila-Leppävaara on peruttu asetinlaitevian vuoksi"
          routeLine="Y, S, U, L, E, A"
          routeMode="rail"
          severityLevel="WARNING"
        />
      </ComponentUsageExample>
    </div>
  </div>
);
