import React from 'react';
import Relay from 'react-relay';
import moment from 'moment';
import { FormattedMessage, intlShape } from 'react-intl';
import find from 'lodash/find';
import DisruptionRow from './DisruptionRow';

function DisruptionListContainer({ alerts }, { intl }) {
  if (!alerts || !alerts.alerts || alerts.alerts.length === 0) {
    return (
      <FormattedMessage
        id="disruption-info-no-alerts"
        defaultMessage="No known disruptions or diversions to the route"
      />
    );
  }

  const alertElements = alerts.alerts.map((alert) => {
    const { id } = alert;
    const startTime = moment(alert.effectiveStartDate * 1000);
    const endTime = moment(alert.effectiveEndDate * 1000);
    const cause = 'because';
    const translation = find(alert.alertDescriptionTextTranslations,
                               ['language', intl.locale]);
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

  return <div>{alertElements}</div>;
}

DisruptionListContainer.contextTypes = {
  intl: intlShape,
};

DisruptionListContainer.propTypes = {
  alerts: React.PropTypes.object,
};

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
        mode
      }
    }
  }
  `,
};

export default Relay.createContainer(DisruptionListContainer, {
  fragments: relayFragment,
});
