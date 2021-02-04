import PropTypes from 'prop-types';
import React from 'react';
import { useSharedLocalStorageEmitter } from '@hsl-fi/shared-local-storage';

const KEYS = ['saved-searches', 'favouriteStore', 'futureRoutes'];

const LocalStorageEmitter = (props, { config }) => {
  useSharedLocalStorageEmitter(KEYS, config.localStorageTarget);

  return <div aria-hidden="true">LocalStorageEmitter</div>;
};

LocalStorageEmitter.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default LocalStorageEmitter;
