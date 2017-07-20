import PropTypes from 'prop-types';
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { routerShape, locationShape } from 'react-router';

import Modal from './Modal';
import Loading from './Loading';
import DisruptionListContainer from './DisruptionListContainer';
import ComponentUsageExample from './ComponentUsageExample';
import { isBrowser } from '../util/browser';

function DisruptionInfo(props, context) {
  const isOpen = () =>
    context.location.state ? context.location.state.disruptionInfoOpen : false;

  const toggleVisibility = () => {
    if (isOpen()) {
      context.router.goBack();
    } else {
      context.router.push({
        ...location,
        state: {
          ...location.state,
          disruptionInfoOpen: true,
        },
      });
    }
  };

  if (isBrowser && isOpen()) {
    return (
      <Modal
        open
        title={
          <FormattedMessage
            id="disruption-info"
            defaultMessage="Disruption info"
          />
        }
        toggleVisibility={toggleVisibility}
      >
        <QueryRenderer
          cacheConfig={{ force: true, poll: 30 * 1000 }}
          query={graphql.experimental`
            query DisruptionInfoQuery($feedIds: [String!]) {
              viewer {
                ...DisruptionListContainer_viewer @arguments(feedIds: $feedIds)
              }
            }
          `}
          variables={{ feedIds: context.config.feedIds }}
          environment={Store}
          render={({ props: innerProps }) =>
            innerProps
              ? <DisruptionListContainer {...innerProps} />
              : <Loading />}
        />
      </Modal>
    );
  }
  return <div />;
}

DisruptionInfo.contextTypes = {
  router: routerShape.isRequired,
  location: locationShape.isRequired,
  config: PropTypes.shape({
    feedIds: PropTypes.arrayOf(PropTypes.string.isRequired),
  }).isRequired,
};

DisruptionInfo.description = () =>
  <div>
    <p>
      Modal that shows all available disruption info. Opened by
      DisruptionInfoButton.
      <strong>Deprecated:</strong> Will be removed in short future in favor of
      announcements page.
    </p>
    <ComponentUsageExample>
      <DisruptionInfo />
    </ComponentUsageExample>
  </div>;

export default DisruptionInfo;
