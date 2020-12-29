import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import {
  isAlertValid,
  getServiceAlertDescription,
  getServiceAlertMetadata,
} from '../util/alertUtils';
import Icon from './Icon';

class DisruptionBanner extends React.Component {
  static propTypes = {
    alerts: PropTypes.arrayOf(PropTypes.object),
    currentTime: PropTypes.number.isRequired,
    language: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
  };

  static contextTypes = {
    config: PropTypes.object.isRequired,
  };

  getAlerts() {
    const { alerts } = this.props;
    const activeAlerts = [];
    alerts.forEach(alert => {
      const currAlert = {
        ...alert,
        ...getServiceAlertMetadata(alert),
      };
      if (
        alert.route &&
        alert.route.mode === this.props.mode &&
        isAlertValid(currAlert, this.props.currentTime)
      ) {
        if (
          !activeAlerts.find(
            activeAlert =>
              activeAlert.alertDescriptionText ===
              currAlert.alertDescriptionText,
          )
        ) {
          activeAlerts.push(currAlert);
        }
      }
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
            href={`${this.context.config.URL.ROOTLINK}/${
              this.props.language === 'fi' ? '' : `${this.props.language}/`
            }${this.context.config.trafficNowLink[this.props.language]}`}
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
      fragment DisruptionBanner_alerts on Alert @relay(plural: true) {
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
          mode
          shortName
        }
      }
    `,
  },
);

export { containerComponent as default, DisruptionBanner as Component };
