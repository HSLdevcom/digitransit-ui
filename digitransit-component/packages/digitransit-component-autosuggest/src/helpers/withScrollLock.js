import React from 'react';
import hooks from '@hsl-fi/hooks';

const withScrollLock = Component => {
  return props => {
    const { lock, unlock } = hooks.useScrollLock();

    return <Component lock={lock} unlock={unlock} {...props} />;
  };
};

export default withScrollLock;
