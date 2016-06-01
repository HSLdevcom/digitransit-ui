import React from 'react';
import Relay from 'react-relay';
import moment from 'moment';
import DisruptionRow from './disruption-row';
import { FormattedMessage, intlShape } from 'react-intl';
import find from 'lodash/find';

/* eslint-disable react/prefer-stateless-function */
class DisruptionListContainer extends React.Component {
  static contextTypes = {
    intl: intlShape,
  };

  static propTypes = {
    alerts: React.PropTypes.object,
  };

  render() {
    if (!this.props.alerts || !this.props.alerts.alerts || this.props.alerts.alerts.length === 0) {
      return (
        <FormattedMessage
          id="disruption-info-no-alerts"
          defaultMessage="No disruption info."
        />
      );
    }

    const alerts = this.props.alerts.alerts.map(alert => {
      const { id } = alert;
      const startTime = moment(alert.effectiveStartDate * 1000);
      const endTime = moment(alert.effectiveEndDate * 1000);
      const cause = 'because';
      const translation = find(alert.alertDescriptionTextTranslations,
                               ['language', this.context.intl.locale]);
      const routes = [alert.route];

      return (
        <DisruptionRow
          key={id}
          description={translation.text}
          startTime={startTime}
          endTime={endTime}
          cause={cause}
          routes={routes}
        />
      );
    });

    return <div>{alerts}</div>;
  }
}
/* eslint-enable react/prefer-stateless-function */

export const relayFragment = {
  alerts: () => Relay.QL`
  fragment on QueryType {
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
      route {
        shortName
        type
      }
    }
  }
  `,
};

export default Relay.createContainer(DisruptionListContainer, {
  fragments: relayFragment,
});
