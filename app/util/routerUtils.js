import React from 'react';
import Error404 from '../component/404';
import NetworkError from '../component/NetworkError';
import Loading from '../component/LoadingPage';
import isRelayNetworkError from './relayUtils';

export function errorLoading(err) {
  /* eslint-disable-next-line no-console */
  console.error('Dynamic page loading failed', err);
}

export function getDefault(module) {
  return module.default;
}

/* eslint-disable react/prop-types */
export function getComponentOrLoadingRenderer({
  Component,
  props,
  error,
  retry,
}) {
  if (error) {
    if (isRelayNetworkError(error.message)) {
      return <NetworkError retry={retry} />;
    }
    return <Error404 />;
  }
  if (Component && props) {
    return <Component {...props} />;
  }
  return <Loading />;
}

/* eslint-disable react/prop-types */
export function getComponentOrNullRenderer({ Component, props }) {
  return Component && props ? <Component {...props} /> : null;
}
