import connectToStores from 'fluxible-addons-react/connectToStores';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';

import LocalTime from './LocalTime';
import RouteAlertsContainer from './RouteAlertsContainer';
import RouteAlertsRow from './RouteAlertsRow';
import { TransportMode, RealtimeStateType } from '../constants';
import { routeNameCompare } from '../util/searchUtils';

const getScheduledDepartureTime = stoptime =>
  stoptime.scheduledDeparture + stoptime.serviceDay;

const getTranslationKey = mode => {
  switch (mode) {
    case TransportMode.Bus:
      return 'bus';
    case TransportMode.Ferry:
      return 'ferry';
    case TransportMode.Rail:
      return 'train';
    case TransportMode.Subway:
      return 'metro';
    case TransportMode.Tram:
      return 'tram';
    default:
      return undefined;
  }
};

const DepartureCancelationInfo = ({ pattern, scheduledDepartureTime }) => {
  return (
    <FormattedMessage
      id="departure-is-canceled"
      values={{
        departure: (
          <FormattedMessage
            id={`${getTranslationKey(pattern.route.mode)}-with-route-number`}
            values={{
              routeNumber: pattern.route.shortName,
              headSign: pattern.headsign,
            }}
          />
        ),
        time: <LocalTime time={scheduledDepartureTime} />,
      }}
    />
  );
};

const StopAlertsContainer = ({ currentTime, stop }) => {
  const patternsWithCancellations = stop.stoptimesForServiceDate
    .map(st => ({
      pattern: { ...st.pattern },
      stoptimes: (st.stoptimes || []).filter(
        stoptime => stoptime.realtimeState === RealtimeStateType.Canceled,
      ),
    }))
    .filter(st => st.stoptimes.length > 0);

  const patternsWithServiceAlerts = stop.stoptimesForServiceDate
    .map(st => st.pattern)
    .filter(pattern => pattern.route.alerts.length > 0);

  if (patternsWithServiceAlerts.length === 0) {
    return (
      <div className="no-stop-alerts-message">
        <FormattedMessage
          id="disruption-info-route-no-alerts"
          defaultMessage="No known disruptions or diversions for route."
        />
      </div>
    );
  }
  return (
    <div className="momentum-scroll">
      {patternsWithCancellations
        .sort((a, b) => routeNameCompare(a.pattern.route, b.pattern.rout))
        .map(({ pattern, stoptimes }) => (
          <div className="route-alerts-list" key={pattern.code}>
            {stoptimes
              .map(stoptime => getScheduledDepartureTime(stoptime))
              .map(scheduledDepartureTime => (
                <RouteAlertsRow
                  color={pattern.route.color}
                  expired={currentTime > scheduledDepartureTime}
                  header={
                    <DepartureCancelationInfo
                      pattern={pattern}
                      scheduledDepartureTime={scheduledDepartureTime}
                    />
                  }
                  key={scheduledDepartureTime}
                  routeLine={pattern.route.shortName}
                  routeMode={pattern.route.mode.toLowerCase()}
                />
              ))}
          </div>
        ))}
      {patternsWithServiceAlerts
        .sort((a, b) => routeNameCompare(a.route, b.route))
        .map(pattern => (
          <RouteAlertsContainer
            key={pattern.code}
            isScrollable={false}
            patternId={pattern.code}
            route={pattern.route}
          />
        ))}
    </div>
  );
};

StopAlertsContainer.propTypes = {
  currentTime: PropTypes.number.isRequired,
  stop: PropTypes.shape({
    stoptimesForServiceDate: PropTypes.arrayOf(
      PropTypes.shape({
        pattern: PropTypes.shape({
          code: PropTypes.string.isRequired,
          route: PropTypes.shape({
            alerts: PropTypes.array.isRequired,
            mode: PropTypes.string.isRequired,
            shortName: PropTypes.string.isRequired,
          }).isRequired,
        }),
      }),
    ).isRequired,
  }).isRequired,
};

const containerComponent = Relay.createContainer(
  connectToStores(StopAlertsContainer, ['TimeStore'], context => ({
    currentTime: context
      .getStore('TimeStore')
      .getCurrentTime()
      .unix(),
  })),
  {
    fragments: {
      stop: () => Relay.QL`
    fragment Timetable on Stop {
      stoptimesForServiceDate(date:$date, omitCanceled:false) {
        pattern {
          headsign
          code
          route {
            ${RouteAlertsContainer.getFragment('route')}
            id
            gtfsId
            shortName
            longName
            mode
            color
            alerts {
              effectiveEndDate
              effectiveStartDate
              id
              trip {
                pattern {
                  code
                }
              }
            }
          }
        }
        stoptimes {
          realtimeState
          scheduledDeparture
          serviceDay
        }
      }
    }
    `,
    },
    initialVariables: {
      date: moment().format('YYYYMMDD'),
      timeRange: 30 * 60 * 60, // 30 hours
    },
  },
);

export { containerComponent as default, StopAlertsContainer as Component };
