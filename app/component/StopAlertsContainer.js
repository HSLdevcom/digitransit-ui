import React from 'react';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';

import RouteAlertsContainer from './RouteAlertsContainer';

const StopAlerts = ({ stop }) => {
  const patternsWithAlerts = stop.stoptimesForPatterns
    .map(stoptime => stoptime.pattern)
    .filter(pattern => pattern.route.alerts.length > 0);
  if (patternsWithAlerts.length === 0) {
    return (
      <div className="no-stop-alerts-message">
        <FormattedMessage
          id="disruption-info-route-no-alerts"
          defaultMessage="No known disruptions or diversions for route."
        />
      </div>
    );
  }
  return patternsWithAlerts.map(pattern => (
    <RouteAlertsContainer
      key={pattern.route.id}
      isScrolling={false}
      patternId={pattern.code}
      route={pattern.route}
    />
  ));
};

const containerComponent = Relay.createContainer(StopAlerts, {
  fragments: {
    stop: () => Relay.QL`
    fragment on Stop {
      stoptimesForPatterns(numberOfDepartures: 1, timeRange: 604800) {
        pattern {
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
                stoptimes {
                  realtimeState
                  scheduledArrival
                  scheduledDeparture
                  stop {
                    gtfsId
                  }
                }
              }
            }
          }
        }
      }
    }
    `,
  },
});

export { containerComponent as default, StopAlerts as Component };
