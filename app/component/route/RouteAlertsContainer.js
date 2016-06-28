import React from 'react';
import Relay from 'react-relay';
import { FormattedMessage, intlShape } from 'react-intl';
import moment from 'moment';

import RouteAlertsRow from './RouteAlertsRow';

class RouteAlertsContainer extends React.Component {

  getAlerts() {
    const alerts = this.props.route.alerts;
    const routeMode = this.props.route.type.toLowerCase();
    const routeLine = this.props.route.shortName;

    if (alerts.length === 0) {
      return (
        <div className="no-alerts-message">
          <FormattedMessage
            id="disruption-info-no-alerts"
            defaultMessage="No disruption info."
          />
        </div>);
    }

    return alerts.map(alert => {
      const { id } = alert;
      const startTime = moment(alert.effectiveStartDate * 1000);
      const endTime = moment(alert.effectiveEndDate * 1000);
      const header = find(alert.alertHeaderTextTranslations,
                                 ['language', this.context.intl.locale]);
      const description = find(alert.alertDescriptionTextTranslations,
                                 ['language', this.context.intl.locale]);
      const active = moment() > endTime;
      return (
        <RouteAlertsRow
          key={id}
          startTime={startTime}
          endTime={endTime}
          header={header.text}
          description={description.text}
          active={active}
          routeMode={routeMode}
          routeLine={routeLine}
        />);
    });
  }

  render() {
    return (
      <div className="route-alerts-list momentum-scroll">
        {this.getAlerts()}
      </div>);
  }
}

RouteAlertsContainer.propTypes = {
  route: React.PropTypes.object.isRequired,
};

RouteAlertsContainer.contextTypes = {
  intl: intlShape,
};

export default Relay.createContainer(RouteAlertsContainer,
  {
    fragments: {
      route: () => Relay.QL`
        fragment on Route {
          type
          shortName
          alerts {
            id
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
          }
        }
      `,
    },
  }
);
