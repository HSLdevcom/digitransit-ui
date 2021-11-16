import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import isEmpty from 'lodash/isEmpty';
import { isAlertValid, getServiceAlertMetadata } from '../util/alertUtils';
import DisruptionBannerAlert from './DisruptionBannerAlert';
import SwipeableTabs from './SwipeableTabs';
import withBreakpoint from '../util/withBreakpoint';

class DisruptionBanner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allAlertsOpen: false,
      tabIndex: 0,
      isOpen: true,
    };
  }

  static propTypes = {
    alerts: PropTypes.arrayOf(PropTypes.object),
    currentTime: PropTypes.number.isRequired,
    language: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    breakpoint: PropTypes.string.isRequired,
  };

  static contextTypes = {
    config: PropTypes.object.isRequired,
  };

  openAllAlerts = () => {
    this.setState({ allAlertsOpen: true });
  };

  onSwipe = i => {
    this.setState({ tabIndex: i });
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

  renderAlert = alert => {
    return (
      <div key={alert.id}>
        <DisruptionBannerAlert
          language={this.props.language}
          alert={alert}
          truncate={!this.state.allAlertsOpen}
          openAllAlerts={this.openAllAlerts}
          onClose={() => this.setState({ isOpen: false })}
        />
      </div>
    );
  };

  render() {
    const activeAlerts = this.getAlerts();

    if (!activeAlerts.length || !this.state.isOpen) {
      return null;
    }
    const tabs = activeAlerts.map(alert => this.renderAlert(alert));

    return (
      <div className="disruption-banner-container">
        {tabs.length > 1 ? (
          <SwipeableTabs
            tabs={tabs}
            tabIndex={this.state.tabIndex}
            onSwipe={this.onSwipe}
            classname="disruption-banner"
            hideArrows={this.props.breakpoint !== 'large'}
            navigationOnBottom
            ariaFrom="swipe-disruption-info"
            ariaFromHeader="swipe-disruption-info-header"
          />
        ) : (
          this.renderAlert(activeAlerts[0])
        )}
      </div>
    );
  }
}
const DisruptionBannerWithBreakpoint = withBreakpoint(DisruptionBanner);

const containerComponent = createFragmentContainer(
  connectToStores(
    DisruptionBannerWithBreakpoint,
    ['TimeStore', 'PreferencesStore'],
    ({ getStore }) => ({
      currentTime: getStore('TimeStore').getCurrentTime().unix(),
      language: getStore('PreferencesStore').getLanguage(),
    }),
  ),
  {
    alerts: graphql`
      fragment DisruptionBanner_alerts on Alert @relay(plural: true) {
        feed
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

export {
  containerComponent as default,
  DisruptionBannerWithBreakpoint as Component,
};
