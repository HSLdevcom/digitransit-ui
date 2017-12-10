import PropTypes from 'prop-types';
import React from 'react';
import { QueryRenderer } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { graphql } from 'relay-runtime';
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
        environment={Store}
        cacheConfig={{ force: true, poll: 30 * 1000 }}
        query={graphql`
          query DisruptionInfoButtonContainerQuery($feedIds: [String!]) {
            viewer {
              alerts(feeds: $feedIds) {
                id
              }
            }
          }
        `}
        variables={{ feedIds }}
        render={({ props: innerProps }) => (
          <DisruptionInfoButton
            hasAlerts={
              innerProps &&
              innerProps.viewer.alerts &&
              innerProps.viewer.alerts.length > 0
            }
            toggleDisruptionInfo={openDisruptionInfo}
          />
        )}
      />
    );
  }
  return <div />;
}

DisruptionInfoButtonContainer.contextTypes = {
  router: routerShape.isRequired, // eslint-disable-line react/no-typos
  location: locationShape.isRequired, // eslint-disable-line react/no-typos
  config: PropTypes.shape({
    feedIds: PropTypes.arrayOf(PropTypes.string.isRequired),
  }).isRequired,
};

export default DisruptionInfoButtonContainer;
