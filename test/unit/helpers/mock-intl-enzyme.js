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
import * as found from 'found';
import translations from '../../../app/translations/en';
import IntlBridge from '../../../app/util/IntlBridge';
import * as ConfigContext from '../../../app/configurations/ConfigContext';
import TestProviders from './mock-providers';
import { mockContext } from './mock-context';

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
