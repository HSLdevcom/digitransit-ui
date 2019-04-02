import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import Relay from 'react-relay/classic';

import AlertList from './AlertList';
import DepartureCancelationInfo from './DepartureCancelationInfo';
import { DATE_FORMAT, AlertSeverityLevelType } from '../constants';
import {
  RouteAlertsWithContentQuery,
  StopAlertsWithContentQuery,
} from '../util/alertQueries';
import {
  getCancelationsForStop,
  getServiceAlertsForStop,
  otpServiceAlertShape,
  getServiceAlertsForStopRoutes,
} from '../util/alertUtils';

const StopAlertsContainer = ({ stop }, { intl }) => {
  const cancelations = getCancelationsForStop(stop).map(stoptime => {
    const { color, mode, shortName } = stoptime.trip.route;
    const departureTime = stoptime.serviceDay + stoptime.scheduledDeparture;
    return {
      header: (
        <DepartureCancelationInfo
          firstStopName={stoptime.trip.stops[0].name}
          headsign={stoptime.headsign}
          routeMode={mode}
          scheduledDepartureTime={departureTime}
          shortName={shortName}
        />
      ),
      route: {
        color,
        mode,
        shortName,
      },
      severityLevel: AlertSeverityLevelType.Warning,
      validityPeriod: {
        startTime: departureTime,
      },
    };
  });
  const serviceAlerts = [
    ...getServiceAlertsForStop(stop, intl.locale),
    ...getServiceAlertsForStopRoutes(stop, intl.locale),
  ];

  return (
    <AlertList cancelations={cancelations} serviceAlerts={serviceAlerts} />
  );
};

StopAlertsContainer.propTypes = {
  stop: PropTypes.shape({
    alerts: PropTypes.arrayOf(otpServiceAlertShape).isRequired,
    stoptimes: PropTypes.arrayOf(
      PropTypes.shape({
        headsign: PropTypes.string.isRequired,
        realtimeState: PropTypes.string,
        scheduledDeparture: PropTypes.number,
        serviceDay: PropTypes.number,
        trip: PropTypes.shape({
          pattern: PropTypes.shape({
            code: PropTypes.string,
          }),
          route: PropTypes.shape({
            alerts: PropTypes.arrayOf(otpServiceAlertShape).isRequired,
            color: PropTypes.string,
            mode: PropTypes.string.isRequired,
            shortName: PropTypes.string.isRequired,
          }).isRequired,
          stops: PropTypes.arrayOf(
            PropTypes.shape({
              name: PropTypes.string,
            }),
          ).isRequired,
        }).isRequired,
      }),
    ).isRequired,
  }).isRequired,
};

StopAlertsContainer.contextTypes = {
  intl: intlShape.isRequired,
};

const containerComponent = Relay.createContainer(StopAlertsContainer, {
  fragments: {
    stop: () => Relay.QL`
      fragment Timetable on Stop {
        ${StopAlertsWithContentQuery}
        stoptimes: stoptimesWithoutPatterns(
          startTime:$startTime,
          timeRange:$timeRange,
          numberOfDepartures:100,
          omitCanceled:false
        ) {
          headsign
          realtimeState
          scheduledDeparture
          serviceDay
          trip {
            pattern {
              code
            }
            route {
              color
              mode
              shortName
              ${RouteAlertsWithContentQuery}
            }
            stops {
              name
            }
          }
        }
      }
    `,
  },
  initialVariables: {
    startTime: moment().unix() - 60 * 5, // 5 mins in the past
    timeRange: 60 * 15, // -5 + 15 = 10 mins in the future
    date: moment().format(DATE_FORMAT),
  },
});

export { containerComponent as default, StopAlertsContainer as Component };
