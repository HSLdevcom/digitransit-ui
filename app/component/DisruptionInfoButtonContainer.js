import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import { matchShape, routerShape } from 'found';
import ReactRelayContext from 'react-relay/lib/ReactRelayContext';
import DisruptionInfoButton from './DisruptionInfoButton';
import { isBrowser } from '../util/browser';
import { addAnalyticsEvent } from '../util/analyticsUtils';

function DisruptionInfoButtonContainer(outerProps, { config: { feedIds } }) {
  const { setDisruptionInfoOpen } = outerProps;
  const { environment } = useContext(ReactRelayContext);
  if (isBrowser) {
    const openDisruptionInfo = () => {
      setDisruptionInfoOpen(true);
      addAnalyticsEvent({
        category: 'Navigation',
        action: 'OpenDisruptions',
        name: null,
      });
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
  return <div />;
}

DisruptionInfoButtonContainer.propTypes = {
  setDisruptionInfoOpen: PropTypes.func.isRequired,
};

DisruptionInfoButtonContainer.contextTypes = {
  router: routerShape.isRequired,
  match: matchShape.isRequired,
  config: PropTypes.shape({
    feedIds: PropTypes.arrayOf(PropTypes.string.isRequired),
  }).isRequired,
};

export default DisruptionInfoButtonContainer;
