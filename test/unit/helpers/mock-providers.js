import React, { useMemo } from 'react';
import { RouterContext, routerShape, matchShape } from 'found';
import PropTypes from 'prop-types';
import { ConfigProvider } from '../../../app/configurations/ConfigContext';
import { TimeProvider } from '../../../app/hooks/TimeContext';
import { mockContext } from './mock-context';
import { configShape } from '../../../app/util/shapes';

/**
 * Wraps children with ConfigProvider, TimeProvider and RouterContext.Provider
 * so that hooks like useConfigContext(), useCurrentTime() and useRouter() work
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
      <TimeProvider>
        <RouterContext.Provider value={routerContextValue}>
          {children}
        </RouterContext.Provider>
      </TimeProvider>
    </ConfigProvider>
  );
}

TestProviders.propTypes = {
  children: PropTypes.element.isRequired,
  config: configShape,
  match: matchShape,
  router: routerShape,
};
