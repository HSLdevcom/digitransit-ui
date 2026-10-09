import React from 'react';
import Error404 from '../component/404';
import NetworkError from '../component/NetworkError';
import Loading from '../component/LoadingPage';
import isRelayNetworkError from '../../utils/client/relayUtils';

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
 * Like getComponentOrNullRenderer but, while a refetch is in flight for the same
 * route params, keeps rendering the last props to avoid a flash of empty content.
 * Unlike returning undefined, this does not keep the previous page mounted when
 * navigating to a different page.
 */
export function createStickyRenderer() {
  let last = null;
  return function renderSticky({ Component, props, match }) {
    const key = JSON.stringify(match.params);
    if (Component && props) {
      last = { key, Component, props };
      return <Component {...props} />;
    }
    if (last && last.key === key) {
      return <last.Component {...last.props} />;
    }
    return null;
  };
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
