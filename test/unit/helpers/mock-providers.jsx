import React, { useMemo } from 'react';
import { RouterContext } from 'found';
import { ReactRelayContext } from 'react-relay';
import PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';
import { render } from '@testing-library/react';
import {
  routerShape,
  matchShape,
  configShape,
} from '../../../utils/client/shapes';
import { ConfigProvider } from '../../../app/client/ConfigContext';
import { TimeProvider, TimeContext } from '../../../app/hooks/TimeContext';
import translations from '../../../app/translations/en';
import { mockContext } from './mock-context';

const defaultMessages = translations.en || translations;
const noop = () => {};
const mockRelayEnvironment = {
  check: noop,
  lookup: noop,
  retain: noop,
  execute: noop,
  subscribe: noop,
};
const mockRelayContext = { environment: mockRelayEnvironment, variables: {} };

// Remove when Fluxible is fully replaced
class LegacyContextProvider extends React.Component {
  getChildContext() {
    const ctx = {
      getStore: this.props.getStore || mockContext.getStore,
      executeAction: this.props.executeAction || mockContext.executeAction,
    };
    // Only provide config/match when explicitly set, so the legacy
    // context isn't shadowed for components that read it directly.
    if (this.props.config) {
      ctx.config = this.props.config;
    }
    if (this.props.match) {
      ctx.match = this.props.match;
    }
    if (this.props.router) {
      ctx.router = this.props.router;
    }
    return ctx;
  }

  render() {
    return this.props.children;
  }
}

LegacyContextProvider.childContextTypes = {
  config: PropTypes.object,
  match: matchShape,
  router: routerShape,
  getStore: PropTypes.func,
  executeAction: PropTypes.func,
};

LegacyContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
  config: PropTypes.object,
  match: matchShape,
  router: routerShape,
  getStore: PropTypes.func,
  executeAction: PropTypes.func,
};

// Wraps the component under test with the intl, config, relay and router
// context providers used by renderWithProviders below.
export default function TestProviders({
  children,
  config,
  match,
  router,
  locale = 'en',
  messages = defaultMessages,
  currentTime,
}) {
  const routerCtx = useMemo(
    () => ({
      match: match || mockContext.match,
      router: router || mockContext.router,
    }),
    [match, router],
  );
  const inner = (
    <LegacyContextProvider config={config} match={match} router={router}>
      <ReactRelayContext.Provider value={mockRelayContext}>
        <RouterContext.Provider value={routerCtx}>
          {children}
        </RouterContext.Provider>
      </ReactRelayContext.Provider>
    </LegacyContextProvider>
  );
  return (
    <IntlProvider locale={locale} messages={messages}>
      <ConfigProvider value={config || mockContext.config}>
        {currentTime !== undefined ? (
          <TimeContext.Provider value={currentTime}>
            {inner}
          </TimeContext.Provider>
        ) : (
          <TimeProvider>{inner}</TimeProvider>
        )}
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
  currentTime: PropTypes.number,
};

/**
 * @param {React.ReactElement} ui - Component under test
 * @param {{ config?: object, match?: object, router?: object, locale?: string, messages?: object }} opts
 */
export function renderWithProviders(ui, opts = {}) {
  const {
    config = mockContext.config,
    match = mockContext.match,
    router = mockContext.router,
    locale,
    messages,
    currentTime,
    ...renderOpts
  } = opts;
  const Wrapper = ({ children }) => (
    <TestProviders
      config={config}
      match={match}
      router={router}
      locale={locale}
      messages={messages}
      currentTime={currentTime}
    >
      {children}
    </TestProviders>
  );
  Wrapper.propTypes = { children: PropTypes.node.isRequired };
  return render(ui, { wrapper: Wrapper, ...renderOpts });
}
