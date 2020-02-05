import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';

import AlertList from './AlertList';
import DepartureCancelationInfo from './DepartureCancelationInfo';
import {
  getCancelationsForStop,
  getServiceAlertsForStop,
  otpServiceAlertShape,
  getServiceAlertsForStopRoutes,
  getServiceAlertsForTerminalStops,
  routeHasServiceAlert,
  getServiceAlertsForRoute,
  routeHasCancelation,
  getCancelationsForRoute,
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
      validityPeriod: {
        startTime: departureTime,
      },
    };
  });

  const serviceAlertsForRoutes = [];
  const disruptionsForRoutes = [];

  if (stop.routes) {
    stop.routes.forEach(
      route =>
        routeHasServiceAlert(route) &&
        serviceAlertsForRoutes.push(
          ...getServiceAlertsForRoute(route, route.gtfsId, intl.locale),
        ) &&
        (routeHasCancelation(route) &&
          disruptionsForRoutes.push(
            ...getCancelationsForRoute(route, route.gtfsId, intl.locale),
          )),
    );
  }

  const isTerminal = !stop.code;
  const serviceAlerts = [
    // Alerts for terminal's stops.
    ...getServiceAlertsForTerminalStops(isTerminal, stop, intl.locale),
    ...getServiceAlertsForStop(stop, intl.locale),
    ...getServiceAlertsForStopRoutes(stop, intl.locale),
    ...serviceAlertsForRoutes,
    ...disruptionsForRoutes,
  ];

  return (
    <AlertList
      showRouteNameLink={false}
      cancelations={cancelations}
      serviceAlerts={serviceAlerts}
    />
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

const containerComponent = createFragmentContainer(StopAlertsContainer, {
  stop: graphql`
    fragment StopAlertsContainer_stop on Stop
      @argumentDefinitions(
        startTime: { type: "Long" }
        timeRange: { type: "Int", default: 900 }
        date: { type: "String" }
      ) {
      routes {
        gtfsId
        shortName
        longName
        mode
        color
        alerts {
          id
          alertDescriptionText
          alertHash
          alertHeaderText
          alertSeverityLevel
          alertUrl
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
          alertUrlTranslations {
            language
            text
          }
          trip {
            pattern {
              code
            }
          }
        }
      }
      id
      gtfsId
      code
      stops {
        id
        gtfsId
        alerts {
          id
          alertDescriptionText
          alertHash
          alertHeaderText
          alertSeverityLevel
          alertUrl
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
          alertUrlTranslations {
            language
            text
          }
        }
      }
      alerts {
        id
        alertDescriptionText
        alertHash
        alertHeaderText
        alertSeverityLevel
        alertUrl
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
        alertUrlTranslations {
          language
          text
        }
      }
      stoptimes: stoptimesWithoutPatterns(
        startTime: $startTime
        timeRange: $timeRange
        numberOfDepartures: 100
        omitCanceled: false
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
            gtfsId
            alerts {
              id
              alertDescriptionText
              alertHash
              alertHeaderText
              alertSeverityLevel
              alertUrl
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
              alertUrlTranslations {
                language
                text
              }
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
      }
    }
  `,
});

export { containerComponent as default, StopAlertsContainer as Component };
