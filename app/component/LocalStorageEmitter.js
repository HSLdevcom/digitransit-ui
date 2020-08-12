import React from 'react';
import { useSharedLocalStorageEmitter } from '@hsl-fi/shared-local-storage';

const KEYS = ['saved-searches'];

const LocalStorageEmitter = (props, { config }) => {
  useSharedLocalStorageEmitter(KEYS, config.localStorageTarget);

  return <div aria-hidden="true">LocalStorageEmitter</div>;
};

export default LocalStorageEmitter;
