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

/**
 * Like getComponentOrLoadingRenderer but treats any null value in `requiredKeys`
 * as a missing/invalid backend node and renders <Error404 /> instead of passing
 * null props into a component that requires them.
 *
 * Use this when the GraphQL query may return null for a node
 * (e.g. pattern(id: $id) returns null for an unknown id).
 *
 * @param {string[]} requiredKeys - prop keys that must be non-null to render
 */
export function getComponentOrLoadingRendererWithRequired(requiredKeys) {
  return function renderWithRequired({ Component, props, error, retry }) {
    if (error) {
      if (isRelayNetworkError(error.message)) {
        return <NetworkError retry={retry} />;
      }
      return <Error404 />;
    }
    if (Component && props) {
      if (requiredKeys.some(key => props[key] == null)) {
        return <Error404 />;
      }
      return <Component {...props} />;
    }
    return <Loading />;
  };
}
