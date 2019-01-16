import connectToStores from 'fluxible-addons-react/connectToStores';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';

import DepartureCancelationInfo from './DepartureCancelationInfo';
import RouteAlertsContainer from './RouteAlertsContainer';
import RouteAlertsRow from './RouteAlertsRow';
import { RealtimeStateType } from '../constants';
import { routeNameCompare } from '../util/searchUtils';

const getScheduledDepartureTime = stoptime =>
  stoptime.scheduledDeparture + stoptime.serviceDay;

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

  if (
    patternsWithCancellations.length === 0 &&
    patternsWithServiceAlerts.length === 0
  ) {
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
        .sort((a, b) => routeNameCompare(a.pattern.route, b.pattern.route))
        .map(({ pattern, stoptimes }) => (
          <div className="route-alerts-list" key={pattern.code}>
            {stoptimes
              .map(stoptime => getScheduledDepartureTime(stoptime))
              .sort((a, b) => b - a)
              .map(scheduledDepartureTime => (
                <RouteAlertsRow
                  color={pattern.route.color}
                  expired={currentTime > scheduledDepartureTime}
                  header={
                    <DepartureCancelationInfo
                      firstStopName={pattern.stops[0].name}
                      headsign={pattern.headsign}
                      routeMode={pattern.route.mode}
                      scheduledDepartureTime={scheduledDepartureTime}
                      shortName={pattern.route.shortName}
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
          stops: PropTypes.arrayOf(
            PropTypes.shape({
              name: PropTypes.string.isRequired,
            }),
          ),
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
          stops {
            name
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
    },
  },
);

export { containerComponent as default, StopAlertsContainer as Component };
