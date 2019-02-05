import React from 'react';

import Error404 from '../component/404';
import NetworkError from '../component/NetworkError';
import Loading from '../component/LoadingPage';

export function errorLoading(err) {
  /* eslint-disable-next-line no-console */
  console.error('Dynamic page loading failed', err);
}

export function loadRoute(cb) {
  return module => cb(null, module.default);
}

export function getDefault(module) {
  return module.default;
}

/* eslint-disable react/prop-types */
export function RelayRenderer({ error, props, element, retry }) {
  if (error) {
    if (
      error.message === 'Failed to fetch' || // Chrome
      error.message === 'Network request failed' // Safari && FF && IE
    ) {
      return <NetworkError retry={retry} />;
    }
    return <Error404 />;
  }
  if (props) {
    return React.cloneElement(element, props);
  }
  return <Loading />;
}

export const ComponentLoading404Renderer = {
  header: ({ error, props, element, retry }) => {
    if (error) {
      if (
        error.message === 'Failed to fetch' || // Chrome
        error.message === 'Network request failed' // Safari && FF && IE
      ) {
        return <NetworkError retry={retry} />;
      }
      return <Error404 />;
    }
    if (props) {
      return React.cloneElement(element, props);
    }
    return <Loading />;
  },
  map: ({ error, props, element }) => {
    if (error) {
      return null;
    }
    if (props) {
      return React.cloneElement(element, props);
    }
    return undefined;
  },
  title: ({ props, element }) =>
    React.cloneElement(element, { route: null, ...props }),
  content: ({ props, element }) =>
    props ? React.cloneElement(element, props) : <div className="flex-grow" />,
};
/* eslint-enable react/prop-types */
