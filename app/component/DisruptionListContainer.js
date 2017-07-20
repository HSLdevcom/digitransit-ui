import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import moment from 'moment';
import { FormattedMessage, intlShape } from 'react-intl';
import find from 'lodash/find';
import DisruptionRow from './DisruptionRow';

function DisruptionListContainer({ viewer }, { intl }) {
  if (!viewer || !viewer.alerts || viewer.alerts.length === 0) {
    return (
      <FormattedMessage
        id="disruption-info-no-alerts"
        defaultMessage="No known disruptions or diversions."
      />
    );
  }

  const alertElements = viewer.alerts.map(alert => {
    const { id } = alert;
    const startTime = moment(alert.effectiveStartDate * 1000);
    const endTime = moment(alert.effectiveEndDate * 1000);
    const cause = 'because';
    const routes = [alert.route];
    const translation = find(alert.alertDescriptionTextTranslations, [
      'language',
      intl.locale,
    ]);

    const description = translation
      ? translation.text
      : alert.alertDescriptionText;

    return (
      <DisruptionRow
        key={id}
        description={description}
        startTime={startTime}
        endTime={endTime}
        cause={cause}
        routes={routes}
      />
    );
  });

  return (
    <div>
      {alertElements}
    </div>
  );
}

DisruptionListContainer.contextTypes = {
  intl: intlShape,
};

DisruptionListContainer.propTypes = {
  viewer: PropTypes.shape({
    alerts: PropTypes.array,
  }).isRequired,
};

export default createFragmentContainer(DisruptionListContainer, {
  viewer: graphql.experimental`
    fragment DisruptionListContainer_viewer on QueryType
      @argumentDefinitions(feedIds: { type: "[String!]", defaultValue: [] }) {
      alerts(feeds: $feedIds) {
        id
        feed
        alertHeaderText
        alertHeaderTextTranslations {
          text
          language
        }
        alertDescriptionText
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
});
