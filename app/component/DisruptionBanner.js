import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';

class DisruptionBanner extends React.Component {
  static propTypes = {
    alerts: PropTypes.any,
  };

  getAlerts() {
    const { alerts } = this.props;
    const activeAlerts = [];
    alerts.edges.forEach(alert => {
      const { place } = alert.node;
      if (place.alerts.length > 0) {
        activeAlerts.push(...place.alerts);
      }
      place.stoptimesWithoutPatterns.forEach(stoptime => {
        if (stoptime.trip.route.alerts.length > 0) {
          activeAlerts.push(...stoptime.trip.route.alerts);
        }
      });
    });
  }

  render() {
    this.getAlerts();
    return <div>disruptions</div>;
  }
}

const containerComponent = createFragmentContainer(DisruptionBanner, {
  alerts: graphql`
    fragment DisruptionBanner_alerts on placeAtDistanceConnection
      @argumentDefinitions(
        startTime: { type: "Long!", defaultValue: 0 }
        omitNonPickups: { type: "Boolean!", defaultValue: false }
      ) {
      edges {
        node {
          place {
            __typename
            ... on Stop {
              alerts {
                alertSeverityLevel
                alertEffect
                alertCause
                alertDescriptionText
              }
              stoptimesWithoutPatterns(omitNonPickups: $omitNonPickups) {
                trip {
                  route {
                    alerts {
                      alertSeverityLevel
                      alertEffect
                      alertCause
                      alertDescriptionText
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
});

export { containerComponent as default, DisruptionBanner as Component };
