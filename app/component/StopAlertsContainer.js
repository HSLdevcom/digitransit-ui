import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import Relay from 'react-relay/classic';

import AlertList from './AlertList';
import DepartureCancelationInfo from './DepartureCancelationInfo';
import { DATE_FORMAT } from '../constants';
import {
  patternHasServiceAlert,
  stoptimeHasCancelation,
  getServiceAlertsForRoute,
  otpServiceAlertShape,
} from '../util/alertUtils';

const StopAlertsContainer = ({ stop }, { intl }) => {
  const cancelations = stop.stoptimesForServiceDate
    .filter(st => Array.isArray(st.stoptimes))
    .map(st => ({
      pattern: st.pattern,
      stoptimes: st.stoptimes.filter(stoptimeHasCancelation),
    }))
    .filter(st => st.stoptimes.length > 0)
    .map(({ pattern, stoptimes }) => {
      const { color, mode, shortName } = pattern.route;
      return stoptimes.map(stoptime => {
        const departureTime = stoptime.serviceDay + stoptime.scheduledDeparture;
        return {
          header: (
            <DepartureCancelationInfo
              firstStopName={pattern.stops[0].name}
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
          validityPeriod: {
            startTime: departureTime,
          },
        };
      });
    })
    .reduce((a, b) => a.concat(b), []);

  const serviceAlerts = stop.stoptimesForServiceDate
    .map(st => st.pattern)
    .filter(patternHasServiceAlert)
    .map(pattern => getServiceAlertsForRoute(pattern.route, intl.locale))
    .reduce((a, b) => a.concat(b), []);

  return (
    <AlertList cancelations={cancelations} serviceAlerts={serviceAlerts} />
  );
};

StopAlertsContainer.propTypes = {
  stop: PropTypes.shape({
    stoptimesForServiceDate: PropTypes.arrayOf(
      PropTypes.shape({
        pattern: PropTypes.shape({
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
        }),
        stoptimes: PropTypes.arrayOf(
          PropTypes.shape({
            headsign: PropTypes.string.isRequired,
            realtimeState: PropTypes.string,
            scheduledDeparture: PropTypes.number,
            serviceDay: PropTypes.number,
          }),
        ).isRequired,
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
        stoptimesForServiceDate(date:$date, omitCanceled:false) {
          pattern {
            route {
              color
              mode
              shortName
              alerts {
                alertDescriptionText
                alertHeaderText
                effectiveEndDate
                effectiveStartDate
                alertDescriptionTextTranslations {
                  language
                  text
                }
                alertHeaderTextTranslations {
                  language
                  text
                }
              }
            }
            stops {
              name
            }
          }
          stoptimes {
            headsign
            realtimeState
            scheduledDeparture
            serviceDay
          }
        }
      }
    `,
  },
  initialVariables: {
    date: moment().format(DATE_FORMAT),
  },
});

export { containerComponent as default, StopAlertsContainer as Component };
