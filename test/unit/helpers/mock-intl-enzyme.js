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
import sinon from 'sinon';
import * as ReactIntl from 'react-intl';
import { createIntl, createIntlCache, IntlProvider } from 'react-intl';
import { ReactRelayContext } from 'react-relay';
import { RouterContext } from 'found';
import * as found from 'found';
import IntlBridge from '../../../app/util/IntlBridge';
import translations from '../../../app/translations/en';
import * as ConfigContext from '../../../app/configurations/ConfigContext';
import { ConfigProvider } from '../../../app/configurations/ConfigContext';
import TestProviders from './mock-providers';
import { mockContext } from './mock-context';

const mockRelayContext = { environment: {}, variables: {} };

const getMessages = locale => translations[locale] || {};

const intlCache = createIntlCache();

// Tracks stubs created by shallowWithIntl (not by test-specific code)
// so init.js can restore them after each test.
let ownedUseIntlStub = null;
let ownedConfigContextStub = null;
let ownedUseRouterStub = null;

export function restoreOwnedIntlStub() {
  if (ownedUseIntlStub) {
    ownedUseIntlStub.restore();
    ownedUseIntlStub = null;
  }
}

export function restoreOwnedContextStubs() {
  if (ownedConfigContextStub) {
    ownedConfigContextStub.restore();
    ownedConfigContextStub = null;
  }
  if (ownedUseRouterStub) {
    ownedUseRouterStub.restore();
    ownedUseRouterStub = null;
  }
}

function applyContextStubs({ config, match, router } = {}) {
  const configValue = config || mockContext.config;
  const routerValue = {
    match: match || mockContext.match,
    router: router || mockContext.router,
  };

  const configAlreadyStubbed =
    typeof ConfigContext.useConfigContext.restore === 'function';
  if (!configAlreadyStubbed) {
    ownedConfigContextStub = sinon
      .stub(ConfigContext, 'useConfigContext')
      .returns(configValue);
  }

  const routerAlreadyStubbed = typeof found.useRouter.restore === 'function';
  if (!routerAlreadyStubbed) {
    ownedUseRouterStub = sinon.stub(found, 'useRouter').returns(routerValue);
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
    ...additionalOptions
  } = {},
) => {
  const intl = createIntl({ locale, messages }, intlCache);

  // Stub useIntl() for function components, unless already stubbed by test code.
  const alreadyStubbed = typeof ReactIntl.useIntl.restore === 'function';
  if (!alreadyStubbed) {
    if (!ownedUseIntlStub) {
      ownedUseIntlStub = sinon.stub(ReactIntl, 'useIntl').returns(intl);
    } else {
      ownedUseIntlStub.returns(intl);
    }
  }

  applyContextStubs({ config, match, router });

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
 * Creates a sinon sandbox pre-loaded with stubs for useIntl() and
 * useConfigContext(). Use this instead of shallowWithIntl when individual
 * `it` blocks need to override what the stubs return — for example to test
 * behaviour under a different config flag or locale.
 * When no per-test overrides are needed, prefer shallowWithIntl instead.
 *
 * @param {Object} [overrides] - Optional baseline overrides applied to every test in the suite
 * @param {Object} [overrides.intl] - Partial intl mock (merged over the default stub object)
 * @param {Object} [overrides.config] - Partial config (merged over mockContext.config)
 * @returns {{ sandbox: sinon.SinonSandbox, mocks: { intl: object, config: object }, stubs: { useIntl: sinon.SinonStub, useConfigContext: sinon.SinonStub } }}
 */
export const createShallowHookSandbox = (overrides = {}) => {
  const sandbox = sinon.createSandbox();

  const mocks = {
    intl: {
      formatMessage: sandbox.stub().returns('translated text'),
      locale: 'en',
      ...overrides.intl,
    },
    config: {
      ...mockContext.config,
      ...overrides.config,
    },
  };

  const stubs = {
    useIntl: sandbox.stub(ReactIntl, 'useIntl').returns(mocks.intl),
    useConfigContext: sandbox
      .stub(ConfigContext, 'useConfigContext')
      .returns(mocks.config),
  };

  return { sandbox, mocks, stubs };
};
