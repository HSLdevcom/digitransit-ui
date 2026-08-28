import React, { useMemo } from 'react';
import { RouterContext, routerShape, matchShape } from 'found';
import PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';
import { render } from '@testing-library/react';
import { ConfigProvider } from '../../../app/configurations/ConfigContext';
import { TimeProvider } from '../../../app/hooks/TimeContext';
import { mockContext } from './mock-context';
import { configShape } from '../../../app/util/shapes';

// Default export used by Enzyme's mountWithIntl as wrappingComponent
export default function TestProviders({
  children,
  config,
  match,
  router,
  locale = 'en',
  messages = {},
}) {
  const routerCtx = useMemo(
    () => ({
      match: match || mockContext.match,
      router: router || mockContext.router,
    }),
    [match, router],
  );
  return (
    <IntlProvider locale={locale} messages={messages}>
      <ConfigProvider value={config || mockContext.config}>
        <TimeProvider>
          <RouterContext.Provider value={routerCtx}>
            {children}
          </RouterContext.Provider>
        </TimeProvider>
      </ConfigProvider>
    </IntlProvider>
  );
}

TestProviders.propTypes = {
  children: PropTypes.element.isRequired,
  config: configShape,
  match: matchShape,
  router: routerShape,
  locale: PropTypes.string,
  messages: PropTypes.objectOf(PropTypes.string),
};

/**
 * @param {React.ReactElement} ui - Component under test
 * @param {{ config?: object, match?: object, router?: object, locale?: string, messages?: object }} opts
 */
export function renderWithProviders(ui, opts = {}) {
  const { config, match, router, locale, messages, ...renderOpts } = opts;
  const Wrapper = ({ children }) => (
    <TestProviders
      config={config}
      match={match}
      router={router}
      locale={locale}
      messages={messages}
    >
      {children}
    </TestProviders>
  );
  Wrapper.propTypes = { children: PropTypes.node.isRequired };
  return render(ui, { wrapper: Wrapper, ...renderOpts });
}
