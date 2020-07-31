import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';

import { AlertSeverityLevelType } from '../constants';
class DisruptionBanner extends React.Component {
  static propTypes = {
    alerts: PropTypes.any,
  };

  getAlerts() {
    const { alerts } = this.props;
    let activeAlerts = [];
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
    activeAlerts = activeAlerts.filter(alert => {
      return alert.alertSeverityLevel === AlertSeverityLevelType.Severe ||
      alert.alertSeverityLevel === AlertSeverityLevelType.Warning 
    })
    console.log(activeAlerts)
  }

  render() {
    this.getAlerts();
    return <div>disruptions</div>;
  }
}

const containerComponent = createFragmentContainer(
  connectToStores(DisruptionBanner, ['TimeStore'], ({ getStore }) => ({
    currentTime: getStore('TimeStore')
      .getCurrentTime()
      .unix(),
  })),
  {
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
                effectiveStartDate
                effectiveEndDate
              }
              stoptimesWithoutPatterns(omitNonPickups: $omitNonPickups) {
                trip {
                  route {
                    alerts {
                      alertSeverityLevel
                      alertEffect
                      alertCause
                      alertDescriptionText
                      effectiveStartDate
                      effectiveEndDate
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
