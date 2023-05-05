import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import isEmpty from 'lodash/isEmpty';
import { isAlertValid } from '../util/alertUtils';
import DisruptionBannerAlert from './DisruptionBannerAlert';
import SwipeableTabs from './SwipeableTabs';
import withBreakpoint from '../util/withBreakpoint';
import { AlertShape } from '../util/shapes';

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
    alerts: PropTypes.arrayOf(AlertShape).isRequired,
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
      if (
        alert?.entities.some(
          // eslint-disable-next-line no-underscore-dangle
          e => e.__typename === 'Route' && e.mode === this.props.mode,
        ) &&
        !isEmpty(alert.alertDescriptionText) &&
        isAlertValid(alert, this.props.currentTime)
      ) {
        if (
          !activeAlerts.find(
            activeAlert =>
              activeAlert.alertDescriptionText === alert.alertDescriptionText,
          )
        ) {
          activeAlerts.push(alert);
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
        effectiveStartDate
        effectiveEndDate
        entities {
          __typename
          ... on Route {
            mode
            shortName
          }
        }
      }
    `,
  },
);

export { containerComponent as default, DisruptionBanner as Component };
