import React from 'react';
import Relay from 'react-relay';
import ViewerRoute from '../route/ViewerRoute';
import { open } from '../action/DisruptionInfoAction';
import DisruptionInfoButton from './DisruptionInfoButton';
import { isBrowser } from '../util/browser';

function DisruptionInfoButtonContainer(props, { executeAction }) {
  if (isBrowser) {
    return (
      <Relay.Renderer
        Container={DisruptionInfoButton}
        forceFetch
        queryConfig={new ViewerRoute()}
        environment={Relay.Store}
        render={({ done, renderProps }) => (done ? (
          <DisruptionInfoButton
            {...renderProps}
            toggleDisruptionInfo={() => executeAction(open)}
          />) : undefined
        )}
      />);
  }
  return <div />;
}

DisruptionInfoButtonContainer.contextTypes = {
  executeAction: React.PropTypes.func.isRequired,
};

export default DisruptionInfoButtonContainer;
