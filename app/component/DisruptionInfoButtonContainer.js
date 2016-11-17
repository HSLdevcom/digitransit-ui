import React from 'react';
import Relay from 'react-relay';
import ViewerRoute from '../route/ViewerRoute';
import { open } from '../action/DisruptionInfoAction';
import DisruptionInfoButton from './DisruptionInfoButton';

function DisruptionInfoButtonContainer() {
  if (typeof window !== 'undefined') {
    return (
      <Relay.Renderer
        Container={DisruptionInfoButton}
        forceFetch
        queryConfig={new ViewerRoute()}
        environment={Relay.Store}
        render={({ done, props }) => (done ? (
          <DisruptionInfoButton
            {...props}
            toggleDisruptionInfo={() => context.executeAction(open)}
          />) : undefined
        )}
      />);
  }
  return <div />;
}

export default DisruptionInfoButtonContainer;
