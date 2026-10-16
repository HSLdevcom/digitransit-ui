import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import ReactRelayContext from 'react-relay/lib/ReactRelayContext';
import DisruptionInfoButton from './DisruptionInfoButton';
import { addAnalyticsEvent } from '../../utils/shared/analyticsUtils';
import { useConfigContext } from '../client/ConfigContext';

function DisruptionInfoButtonContainer({ onClick = () => {} }) {
  const { feedIds } = useConfigContext();
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

export default DisruptionInfoButtonContainer;
