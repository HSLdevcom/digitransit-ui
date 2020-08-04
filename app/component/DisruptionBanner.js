import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { uniqBy } from 'lodash-es';

import { AlertSeverityLevelType } from '../constants';
import { isAlertValid } from '../util/alertUtils';

class DisruptionBanner extends React.Component {
  static propTypes = {
    alerts: PropTypes.shape({
      edges: PropTypes.array.isRequired,
    }).isRequired,
    currentTime: PropTypes.number.isRequired,
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
    const getId = alert => `${alert.id}`;
    activeAlerts = uniqBy(activeAlerts, getId).filter(alert => {
      const alertToCheck = {
        ...alert,
        validityPeriod: {
          startTime: alert.effectiveStartDate,
          endTime: alert.effectiveEndDate,
        },
      };
      return (
        (alert.alertSeverityLevel === AlertSeverityLevelType.Severe ||
          alert.alertSeverityLevel === AlertSeverityLevelType.Warning) &&
        isAlertValid(alertToCheck, this.props.currentTime)
      );
    });
    return activeAlerts;
  }

  render() {
    const activeAlerts = this.getAlerts();
    if (activeAlerts.length > 0) {
      return (
        <div className="disruption-banner-container">
          <div className="disruption-icon-container" />
          <div className="disruption-info-container">
            {activeAlerts[0].alertHeaderText}
          </div>
        </div>
      );
    }
    return null;
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
                  id
                  alertSeverityLevel
                  alertHeaderText
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
                        id
                        alertSeverityLevel
                        alertHeaderText
                        alertEffect
                        alertCause
                        alertDescriptionText
                        effectiveStartDate
                        effectiveEndDate
                        route {
                          shortName
                        }
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
  },
);

export { containerComponent as default, DisruptionBanner as Component };
