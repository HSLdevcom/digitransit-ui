/**
 * Components using react-intl need an intl context.
 * - shallowWithIntl: injects a real intl object via legacy context AND stubs useIntl()
 *   so both class components (contextTypes) and function components (useIntl hook) work.
 *   Also stubs useConfigContext() and useRouter() since shallow rendering does not
 *   support context providers for hooks.
 * - mountWithIntl: wraps with IntlProvider + IntlBridge + TestProviders for full mount tests
 */
import React from 'react';
import PropTypes from 'prop-types';
import { mount, shallow } from 'enzyme';
import { vi } from 'vitest';
import * as ReactIntl from 'react-intl';
import { createIntl, createIntlCache, IntlProvider } from 'react-intl';
import { ReactRelayContext } from 'react-relay';
import { RouterContext } from 'found';
import * as found from 'found';
import IntlBridge from '../../../app/util/IntlBridge';
import translations from '../../../app/translations/en';
import * as ConfigContext from '../../../app/configurations/ConfigContext';
import * as TimeContext from '../../../app/hooks/TimeContext';
import TestProviders from './mock-providers';
import { mockContext } from './mock-context';

// Default currentTime used by shallowWithIntl when no override is given.
const DEFAULT_MOCK_CURRENT_TIME = 1547464412;

const { ConfigProvider } = ConfigContext;

const mockRelayContext = { environment: {}, variables: {} };

const getMessages = locale => translations[locale] || {};

const intlCache = createIntlCache();

// Tracks stubs created by shallowWithIntl (not by test-specific code)
// so init.js can restore them after each test.
let ownedUseIntlStub = null;
let ownedConfigContextStub = null;
let ownedUseRouterStub = null;
let ownedUseCurrentTimeStub = null;

export function restoreOwnedIntlStub() {
  if (ownedUseIntlStub) {
    ownedUseIntlStub.mockRestore();
    ownedUseIntlStub = null;
  }
}

export function restoreOwnedContextStubs() {
  if (ownedConfigContextStub) {
    ownedConfigContextStub.mockRestore();
    ownedConfigContextStub = null;
  }
  if (ownedUseRouterStub) {
    ownedUseRouterStub.mockRestore();
    ownedUseRouterStub = null;
  }
  if (ownedUseCurrentTimeStub) {
    ownedUseCurrentTimeStub.mockRestore();
    ownedUseCurrentTimeStub = null;
  }
}

function applyContextStubs({ config, match, router, currentTime } = {}) {
  const configValue = config || mockContext.config;
  const routerValue = {
    match: match || mockContext.match,
    router: router || mockContext.router,
  };
  const currentTimeValue =
    currentTime !== undefined ? currentTime : DEFAULT_MOCK_CURRENT_TIME;

  const configAlreadyStubbed = vi.isMockFunction(
    ConfigContext.useConfigContext,
  );
  if (!configAlreadyStubbed) {
    ownedConfigContextStub = vi
      .spyOn(ConfigContext, 'useConfigContext')
      .mockReturnValue(configValue);
  }

  const routerAlreadyStubbed = vi.isMockFunction(found.useRouter);
  if (!routerAlreadyStubbed) {
    ownedUseRouterStub = vi
      .spyOn(found, 'useRouter')
      .mockReturnValue(routerValue);
  }

  const useCurrentTimeAlreadyStubbed = vi.isMockFunction(
    TimeContext.useCurrentTime,
  );
  if (!useCurrentTimeAlreadyStubbed) {
    ownedUseCurrentTimeStub = vi
      .spyOn(TimeContext, 'useCurrentTime')
      .mockReturnValue(currentTimeValue);
  } else if (currentTime !== undefined) {
    TimeContext.useCurrentTime.mockReturnValue(currentTimeValue);
  }
}

export const shallowWithIntl = (
  node,
  {
    context = {},
    locale = 'en',
    messages = getMessages(locale),
    config,
    match,
    router,
    currentTime,
    ...additionalOptions
  } = {},
) => {
  const intl = createIntl({ locale, messages }, intlCache);

  // Stub useIntl() for function components, unless already stubbed by test code.
  const alreadyStubbed = vi.isMockFunction(ReactIntl.useIntl);
  if (!alreadyStubbed) {
    if (!ownedUseIntlStub) {
      ownedUseIntlStub = vi.spyOn(ReactIntl, 'useIntl').mockReturnValue(intl);
    } else {
      ownedUseIntlStub.mockReturnValue(intl);
    }
  }

  applyContextStubs({ config, match, router, currentTime });

  return shallow(node, {
    context: { intl, ...context },
    ...additionalOptions,
  });
};

export const mountWithIntl = (
  node,
  {
    context = {},
    childContextTypes = {},
    locale = 'en',
    messages = getMessages(locale),
    config,
    match,
    router,
    ...additionalOptions
  } = {},
) => {
  const fullChildContextTypes = {
    intl: PropTypes.object,
    config: PropTypes.object,
    ...childContextTypes,
  };

  return mount(
    <IntlProvider locale={locale} messages={messages}>
      <IntlBridge>{node}</IntlBridge>
    </IntlProvider>,
    {
      context: {
        ...context,
      },
      childContextTypes: fullChildContextTypes,
      wrappingComponent: TestProviders,
      wrappingComponentProps: { config, match, router },
      ...additionalOptions,
    },
  );
};

/**
 * Mounts a component wrapped with IntlContextProvider, ConfigProvider,
 * ReactRelayContext, and RouterContext — enough for components that use
 * useIntl(), useConfigContext(), useContext(ReactRelayContext), and useRouter().
 *
 * @param {React.Element} node - The component to mount
 * @param {object} options
 * @param {object} options.config - Config object for ConfigProvider
 * @param {string} [options.locale='en'] - Locale for intl
 * @param {object} [options.match] - match object for RouterContext
 * @param {object} [options.router] - router object for RouterContext
 */
export const mountWithProviders = (
  node,
  { config, locale = 'en', match, router } = {},
) => {
  const messages = getMessages(locale);
  const routerContextValue = {
    match: match || mockContext.match,
    router: router || mockContext.router,
  };
  return mount(
    <IntlProvider locale={locale} messages={messages}>
      <ConfigProvider value={config}>
        <ReactRelayContext.Provider value={mockRelayContext}>
          <RouterContext.Provider value={routerContextValue}>
            {node}
          </RouterContext.Provider>
        </ReactRelayContext.Provider>
      </ConfigProvider>
    </IntlProvider>,
  );
};

/**
 * Creates a set of vi.spyOn stubs for useIntl(), useConfigContext() and
 * useCurrentTime() (auto-restored between tests via `restoreMocks: true`).
 * Use this instead of
 * shallowWithIntl when individual `it` blocks need to override what the
 * stubs return — for example to test behaviour under a different config
 * flag, locale, or currentTime.
 * When no per-test overrides are needed, prefer shallowWithIntl instead.
 *
 * @param {Object} [overrides] - Optional baseline overrides applied to every test in the suite
 * @param {Object} [overrides.intl] - Partial intl mock (merged over the default stub object)
 * @param {Object} [overrides.config] - Partial config (merged over mockContext.config)
 * @param {number} [overrides.currentTime] - Value returned by useCurrentTime()
 * @returns {{ mocks: { intl: object, config: object, currentTime: number }, stubs: { useIntl: import('vitest').MockInstance, useConfigContext: import('vitest').MockInstance, useCurrentTime: import('vitest').MockInstance } }}
 */
export const createShallowHookSandbox = (overrides = {}) => {
  const mocks = {
    intl: {
      formatMessage: vi.fn().mockReturnValue('translated text'),
      locale: 'en',
      ...overrides.intl,
    },
    config: {
      ...mockContext.config,
      ...overrides.config,
    },
    currentTime:
      overrides.currentTime !== undefined
        ? overrides.currentTime
        : DEFAULT_MOCK_CURRENT_TIME,
  };

  const stubs = {
    useIntl: vi.spyOn(ReactIntl, 'useIntl').mockReturnValue(mocks.intl),
    useConfigContext: vi
      .spyOn(ConfigContext, 'useConfigContext')
      .mockReturnValue(mocks.config),
    useCurrentTime: vi
      .spyOn(TimeContext, 'useCurrentTime')
      .mockReturnValue(mocks.currentTime),
  };

  return { mocks, stubs };
};
