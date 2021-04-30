import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import isEmpty from 'lodash/isEmpty';
import { isAlertValid, getServiceAlertMetadata } from '../util/alertUtils';
import DisruptionBannerAlert from './DisruptionBannerAlert';

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
        !isEmpty(alert.alertDescriptionText) &&
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

  render() {
    const activeAlerts = this.getAlerts();
    if (activeAlerts.length > 0) {
      return (
        <DisruptionBannerAlert
          alerts={activeAlerts}
          language={this.props.language}
        />
      );
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
        alertHeaderTextTranslations {
          text
          language
        }
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
