import React from 'react';
import { useSharedLocalStorageEmitter } from '@hsl-fi/shared-local-storage';

const KEYS = ['saved-searches'];
const TARGET_ORIGIN = 'https://uusi.hsl.fi';

const LocalStorageEmitter = () => {
  useSharedLocalStorageEmitter(KEYS, TARGET_ORIGIN);

  return <div aria-hidden="true">LocalStorageEmitter</div>;
};

export default LocalStorageEmitter;
