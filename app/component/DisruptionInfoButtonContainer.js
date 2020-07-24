import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import { matchShape, routerShape } from 'found';
import ReactRelayContext from 'react-relay/lib/ReactRelayContext';
import DisruptionInfoButton from './DisruptionInfoButton';
import { isBrowser } from '../util/browser';
import { addAnalyticsEvent } from '../util/analyticsUtils';

function DisruptionInfoButtonContainer(
  outerProps,
  { router, match, config: { feedIds } },
) {
  const { environment } = useContext(ReactRelayContext);
  if (isBrowser) {
    const openDisruptionInfo = () => {
      router.push({
        ...match.location,
        state: {
          ...match.location.state,
          disruptionInfoOpen: true,
        },
      });
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
            toggleDisruptionInfo={openDisruptionInfo}
          />
        )}
      />
    );
  }
  return <div />;
}

DisruptionInfoButtonContainer.contextTypes = {
  router: routerShape.isRequired,
  match: matchShape.isRequired,
  config: PropTypes.shape({
    feedIds: PropTypes.arrayOf(PropTypes.string.isRequired),
  }).isRequired,
};

export default DisruptionInfoButtonContainer;
