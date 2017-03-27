import React from 'react';
import Relay from 'react-relay';
import { routerShape, locationShape } from 'react-router';
import ViewerRoute from '../route/ViewerRoute';
import DisruptionInfoButton from './DisruptionInfoButton';
import { isBrowser } from '../util/browser';

function DisruptionInfoButtonContainer(props, { router, location }) {
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
      <Relay.Renderer
        Container={DisruptionInfoButton}
        forceFetch
        queryConfig={new ViewerRoute()}
        environment={Relay.Store}
        render={({ renderProps }) => (
          <DisruptionInfoButton
            {...renderProps}
            toggleDisruptionInfo={openDisruptionInfo}
          />
        )}
      />);
  }
  return <div />;
}

DisruptionInfoButtonContainer.contextTypes = {
  router: routerShape.isRequired,
  location: locationShape.isRequired,
};

export default DisruptionInfoButtonContainer;
