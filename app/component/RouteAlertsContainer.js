import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { intlShape } from 'react-intl';
import { matchShape } from 'found';

import AlertList from './AlertList';
import DepartureCancelationInfo from './DepartureCancelationInfo';
import {
  getServiceAlertsForRoute,
  getServiceAlertsForRouteStops,
  otpServiceAlertShape,
  tripHasCancelation,
} from '../util/alertUtils';

function RouteAlertsContainer({ route }, { intl, match }) {
  const { color, mode, shortName } = route;
  const { patternId } = match.params;

  const cancelations = route.patterns
    .filter(pattern => pattern.code === patternId)
    .map(pattern => pattern.trips.filter(tripHasCancelation))
    .reduce((a, b) => a.concat(b), [])
    .map(trip => {
      const first = trip.stoptimes[0];
      const departureTime = first.serviceDay + first.scheduledDeparture;
      const last = trip.stoptimes[trip.stoptimes.length - 1];
      return {
        header: (
          <DepartureCancelationInfo
            firstStopName={first.stop.name}
            headsign={first.headsign || trip.tripHeadsign}
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
          endTime: last.serviceDay + last.scheduledArrival,
        },
      };
    });
  const serviceAlerts = [
    ...getServiceAlertsForRoute(route, patternId, intl.locale),
    ...getServiceAlertsForRouteStops(route, patternId, intl.locale),
  ];

  return (
    <AlertList
      showRouteNameLink={false}
      cancelations={cancelations}
      serviceAlerts={serviceAlerts}
    />
  );
}

RouteAlertsContainer.propTypes = {
  route: PropTypes.shape({
    alerts: PropTypes.arrayOf(otpServiceAlertShape).isRequired,
    color: PropTypes.string,
    mode: PropTypes.string.isRequired,
    shortName: PropTypes.string.isRequired,
    patterns: PropTypes.arrayOf(
      PropTypes.shape({
        code: PropTypes.string,
        stops: PropTypes.arrayOf(
          PropTypes.shape({
            alerts: PropTypes.arrayOf(otpServiceAlertShape).isRequired,
          }),
        ),
        trips: PropTypes.arrayOf(
          PropTypes.shape({
            tripHeadsign: PropTypes.string,
            stoptimes: PropTypes.arrayOf(
              PropTypes.shape({
                headsign: PropTypes.string,
                realtimeState: PropTypes.string,
                scheduledDeparture: PropTypes.number,
                serviceDay: PropTypes.number,
                stop: PropTypes.shape({
                  name: PropTypes.string,
                }).isRequired,
              }),
            ).isRequired,
          }),
        ).isRequired,
      }),
    ).isRequired,
  }).isRequired,
};

RouteAlertsContainer.contextTypes = {
  intl: intlShape,
  match: matchShape,
};

const containerComponent = createFragmentContainer(RouteAlertsContainer, {
  route: graphql`
    fragment RouteAlertsContainer_route on Route
    @argumentDefinitions(date: { type: "String" }) {
      color
      mode
      shortName
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
      patterns {
        code
        stops {
          id
          gtfsId
          code
          name
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
        trips: tripsForDate(serviceDate: $date) {
          tripHeadsign
          stoptimes: stoptimesForDate(serviceDate: $date) {
            headsign
            realtimeState
            scheduledArrival
            scheduledDeparture
            serviceDay
            stop {
              name
            }
          }
        }
      }
    }
  `,
});

export { containerComponent as default, RouteAlertsContainer as Component };
