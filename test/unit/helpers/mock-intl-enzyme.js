/**
 * Components using react-intl need an intl context.
 * - shallowWithIntl: injects a real intl object via legacy context AND stubs useIntl()
 *   so both class components (contextTypes) and function components (useIntl hook) work.
 * - mountWithIntl: wraps with IntlProvider + IntlBridge for full mount tests
 */
import React from 'react';
import PropTypes from 'prop-types';
import { mount, shallow } from 'enzyme';
import sinon from 'sinon';
import * as ReactIntl from 'react-intl';
import { createIntl, createIntlCache, IntlProvider } from 'react-intl';
import translations from '../../../app/translations/en';
import IntlBridge from '../../../app/util/IntlBridge';

const getMessages = locale => translations[locale] || {};

const intlCache = createIntlCache();

// Tracks a useIntl stub created by shallowWithIntl (not by test-specific code)
// so init.js can restore it after each test.
let ownedUseIntlStub = null;

export function restoreOwnedIntlStub() {
  if (ownedUseIntlStub) {
    ownedUseIntlStub.restore();
    ownedUseIntlStub = null;
  }
}

export const shallowWithIntl = (
  node,
  {
    context = {},
    locale = 'en',
    messages = getMessages(locale),
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
      ...additionalOptions,
    },
  );
};
