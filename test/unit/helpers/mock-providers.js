import React, { useMemo } from 'react';
import { RouterContext, routerShape, matchShape } from 'found';
import PropTypes from 'prop-types';
import { ConfigProvider } from '../../../app/configurations/ConfigContext';
import { mockContext } from './mock-context';
import { configShape } from '../../../app/util/shapes';

/**
 * Wraps children with ConfigProvider and RouterContext.Provider
 * so that hooks like useConfigContext() and useRouter() work
 * without stubbing.
 */
export default function TestProviders({ children, ...props }) {
  const config = useMemo(
    () => props.config || mockContext.config,
    [props.config],
  );
  const routerContextValue = useMemo(
    () => ({
      match: props.match || mockContext.match,
      router: props.router || mockContext.router,
    }),
    [props.match, props.router],
  );
  return (
    <ConfigProvider value={config}>
      <RouterContext.Provider value={routerContextValue}>
        {children}
      </RouterContext.Provider>
    </ConfigProvider>
  );
}

TestProviders.propTypes = {
  children: PropTypes.element.isRequired,
  config: configShape,
  match: matchShape,
  router: routerShape,
};
