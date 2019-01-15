import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';

import RouteAlertsContainer from './RouteAlertsContainer';
import { routeNameCompare } from '../util/searchUtils';

const StopAlertsContainer = ({ stop }) => {
  const patternsWithAlerts = stop.stoptimesForPatterns
    .map(stoptime => stoptime.pattern)
    .filter(pattern => pattern.route.alerts.length > 0);
  if (patternsWithAlerts.length === 0) {
    return (
      <div className="stop-no-alerts-container">
        <FormattedMessage
          id="disruption-info-no-alerts"
          defaultMessage="No known disruptions or diversions."
        />
      </div>
    );
  }
  return (
    <div className="momentum-scroll">
      {patternsWithAlerts
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
  stop: PropTypes.shape({
    stoptimesForPatterns: PropTypes.arrayOf(
      PropTypes.shape({
        pattern: PropTypes.shape({
          code: PropTypes.string.isRequired,
          route: PropTypes.shape({
            alerts: PropTypes.array.isRequired,
            shortName: PropTypes.string,
          }).isRequired,
        }),
      }),
    ).isRequired,
  }).isRequired,
};

const containerComponent = Relay.createContainer(StopAlertsContainer, {
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
              }
            }
          }
        }
      }
    }
    `,
  },
});

export { containerComponent as default, StopAlertsContainer as Component };
