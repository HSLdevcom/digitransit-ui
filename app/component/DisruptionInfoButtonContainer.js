import PropTypes from 'prop-types';
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { routerShape, locationShape } from 'react-router';
import DisruptionInfoButton from './DisruptionInfoButton';
import { isBrowser } from '../util/browser';

function DisruptionInfoButtonContainer(
  outerProps,
  { router, location, config: { feedIds } },
) {
  if (isBrowser) {
    const openDisruptionInfo = () => {
      router.push({
        ...location,
        state: {
          ...location.state,
          disruptionInfoOpen: true,
        },
      });
    };

    return (
      <QueryRenderer
        cacheConfig={{ force: true, poll: 30 * 1000 }}
        query={graphql.experimental`
          query DisruptionInfoButtonContainerQuery($feedIds: [String!]) {
            viewer {
              ...DisruptionInfoButton_viewer @arguments(feedIds: $feedIds)
            }
          }
        `}
        variables={{ feedIds }}
        environment={Store}
        render={({ props }) =>
          <DisruptionInfoButton
            {...props}
            toggleDisruptionInfo={openDisruptionInfo}
          />}
      />
    );
  }
  return <div />;
}

DisruptionInfoButtonContainer.contextTypes = {
  router: routerShape.isRequired,
  location: locationShape.isRequired,
  config: PropTypes.shape({
    feedIds: PropTypes.arrayOf(PropTypes.string.isRequired),
  }).isRequired,
};

export default DisruptionInfoButtonContainer;
