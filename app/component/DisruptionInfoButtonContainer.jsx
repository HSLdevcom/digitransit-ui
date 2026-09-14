import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import ReactRelayContext from 'react-relay/lib/ReactRelayContext';
import DisruptionInfoButton from './DisruptionInfoButton';
import { addAnalyticsEvent } from '../util/analyticsUtils';

function DisruptionInfoButtonContainer(
  { onClick = () => {} },
  { config: { feedIds } },
) {
  const { environment } = useContext(ReactRelayContext);
  const openDisruptionInfo = () => {
    addAnalyticsEvent({
      category: 'Navigation',
      action: 'OpenDisruptions',
      name: null,
    });
    onClick();
  };

  return (
    <QueryRenderer
      cacheConfig={{ force: true, poll: 30 * 1000 }}
      query={graphql`
        query DisruptionInfoButtonContainerQuery($feedIds: [String!]) {
          viewer {
            ...DisruptionInfoButton_viewer @arguments(feedIds: $feedIds)
          }
        }
      `}
      variables={{ feedIds }}
      environment={environment}
      render={({ props }) => (
        <DisruptionInfoButton
          viewer={null}
          {...props}
          openDisruptionInfo={openDisruptionInfo}
        />
      )}
    />
  );
}

DisruptionInfoButtonContainer.propTypes = {
  onClick: PropTypes.func,
};

DisruptionInfoButtonContainer.contextTypes = {
  config: PropTypes.shape({
    feedIds: PropTypes.arrayOf(PropTypes.string.isRequired),
  }).isRequired,
};

export default DisruptionInfoButtonContainer;
