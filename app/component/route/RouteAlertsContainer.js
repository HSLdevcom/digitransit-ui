import React from 'react';
import Relay from 'react-relay';
import { FormattedMessage, intlShape } from 'react-intl';
import moment from 'moment';
import find from 'lodash/find';

import RouteAlertsRow from './RouteAlertsRow';

class RouteAlertsContainer extends React.Component {

  getAlerts = (alerts) => {
    const routeMode = this.props.route.type.toLowerCase();
    const routeLine = this.props.route.shortName;

    return alerts.map(alert => {
      const { id } = alert;
      const startTime = moment(alert.effectiveStartDate * 1000);
      const endTime = moment(alert.effectiveEndDate * 1000);
      const header = find(alert.alertHeaderTextTranslations,
                                 ['language', this.context.intl.locale]);
      const description = find(alert.alertDescriptionTextTranslations,
                                 ['language', this.context.intl.locale]);
      const currentTime = moment();
      const alertDate = endTime.format('DD.MM.YYYY');
      const currentDate = currentTime.format('DD.MM.YYYY');
      const day = currentDate === alertDate ?
        <FormattedMessage id="today" defaultMessage="Today" /> : alertDate;
      const active = endTime > currentTime;

      return (
        <RouteAlertsRow
          key={id}
          startTime={startTime}
          endTime={endTime}
          header={header ? header.text : null}
          description={description ? description.text : null}
          day={day}
          routeMode={routeMode}
          routeLine={routeLine}
          active={active}
        />);
    });
  }

  render() {
    const alerts = this.props.route.alerts;

    if (alerts.length === 0) {
      return (
        <div className="no-alerts-message">
          <FormattedMessage
            id="disruption-info-no-alerts"
            defaultMessage="No disruption info."
          />
        </div>);
    }

    return (
      <div className="route-alerts-list momentum-scroll">
        {this.getAlerts(alerts)}
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
