import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { routerShape, locationShape } from 'react-router';
import DisruptionInfoButton from './DisruptionInfoButton';
import { isBrowser } from '../util/browser';
import { addAnalyticsEvent } from '../util/analyticsUtils';

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
      addAnalyticsEvent({
        category: 'Navigation',
        action: 'OpenDisruptions',
        name: null,
      });
    };

    return (
      <Relay.Renderer
        Container={DisruptionInfoButton}
        forceFetch
        queryConfig={{
          name: 'ViewerRoute',
          queries: {
            root: (Component, variables) => Relay.QL`
              query {
                viewer {
                  ${Component.getFragment('root', variables)}
                }
              }
           `,
          },
          params: { feedIds },
        }}
        environment={Relay.Store}
        render={({ renderProps, props }) => (
          <DisruptionInfoButton
            {...renderProps}
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
  location: locationShape.isRequired,
  config: PropTypes.shape({
    feedIds: PropTypes.arrayOf(PropTypes.string.isRequired),
  }).isRequired,
};

export default DisruptionInfoButtonContainer;
