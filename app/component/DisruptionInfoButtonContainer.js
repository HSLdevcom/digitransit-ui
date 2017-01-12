import React from 'react';
import Relay from 'react-relay';
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
        render={({ done, renderProps }) => (done ? (
          <DisruptionInfoButton
            {...renderProps}
            toggleDisruptionInfo={openDisruptionInfo}
          />) : undefined
        )}
      />);
  }
  return <div />;
}

DisruptionInfoButtonContainer.contextTypes = {
  router: React.PropTypes.routerShape,
  location: React.PropTypes.locationShape,
};

export default DisruptionInfoButtonContainer;
