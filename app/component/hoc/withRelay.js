import React from 'react';
import { ReactRelayContext } from 'react-relay';

const withRelay = WrappedComponent => props => (
  <ReactRelayContext.Consumer>
    {({ environment }) => (
      <WrappedComponent {...props} relayEnvironment={environment} />
    )}
  </ReactRelayContext.Consumer>
);

export default withRelay;