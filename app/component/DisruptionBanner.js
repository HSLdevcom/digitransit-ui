import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { uniqBy } from 'lodash-es';

import { AlertSeverityLevelType } from '../constants';
import { isAlertValid, getServiceAlertDescription } from '../util/alertUtils';
import Icon from './Icon';

class DisruptionBanner extends React.Component {
  static propTypes = {
    alerts: PropTypes.shape({
      edges: PropTypes.array.isRequired,
    }).isRequired,
    currentTime: PropTypes.number.isRequired,
    language: PropTypes.string,
    trafficNowLink: PropTypes.string,
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
    const getId = alert => `${alert.alertDescriptionText}`;
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

  createAlertText(alert) {
    return getServiceAlertDescription(alert, this.props.language);
  }

  render() {
    const activeAlerts = this.getAlerts();
    if (activeAlerts.length > 0) {
      return activeAlerts.map(alert => {
        return (
          <a
            key={alert.id}
            className="disruption-banner-container"
            href={this.props.trafficNowLink}
            onClick={e => {
              e.stopPropagation();
            }}
          >
            <div className="disruption-icon-container">
              <Icon img="icon-icon_disruption-banner-alert" />
            </div>
            <div className="disruption-info-container">
              {this.createAlertText(alert)}
            </div>
          </a>
        );
      });
    }
    return null;
  }
}

const containerComponent = createFragmentContainer(
  connectToStores(
    DisruptionBanner,
    ['TimeStore', 'PreferencesStore'],
    ({ getStore }) => ({
      currentTime: getStore('TimeStore').getCurrentTime().unix(),
      language: getStore('PreferencesStore').getLanguage(),
    }),
  ),
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
                  alertDescriptionTextTranslations {
                    text
                    language
                  }
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
                        alertDescriptionTextTranslations {
                          text
                          language
                        }
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
