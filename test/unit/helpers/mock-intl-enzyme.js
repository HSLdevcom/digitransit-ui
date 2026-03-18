/**
 * Components using the react-intl module require access to the intl context.
 * This is not available when mounting single components in Enzyme.
 * These helper functions aim to address that and wrap a valid,
 * English-locale intl context around them.
 *
 * see: https://github.com/yahoo/react-intl/wiki/Testing-with-React-Intl
 */

import React from 'react';
import { IntlProvider, intlShape } from 'react-intl';
import { mount, shallow } from 'enzyme';
import { ReactRelayContext } from 'react-relay';
import translations from '../../../app/translations';
import { ConfigProvider } from '../../../app/configurations/ConfigContext';
import { IntlContextProvider } from '../../../app/util/useTranslationsContext';

const mockRelayContext = { environment: {}, variables: {} };

// Create the IntlProvider to retrieve context for wrapping around.
const getIntl = locale => {
  const intlProvider = new IntlProvider(
    { locale, messages: translations[locale] },
    {},
  );
  const { intl } = intlProvider.getChildContext();
  return intl;
};

const providers = {
  en: getIntl('en'),
  fi: getIntl('fi'),
  sv: getIntl('sv'),
};

/**
 * When using React-Intl `injectIntl` on components, props.intl is required.
 */
const nodeWithIntlProp = (node, locale) =>
  React.cloneElement(node, { intl: providers[locale] });

export const shallowWithIntl = (
  node,
  { context, ...additionalOptions } = {},
  locale = 'en',
) =>
  shallow(nodeWithIntlProp(node, locale), {
    context: { ...context, intl: providers[locale] },
    wrappingComponent: IntlContextProvider,
    wrappingComponentProps: { intl: providers[locale] },
    ...additionalOptions,
  });

export const mountWithIntl = (
  node,
  { context, childContextTypes, ...additionalOptions } = {},
  locale = 'en',
) =>
  mount(nodeWithIntlProp(node, locale), {
    context: { ...context, intl: providers[locale] },
    childContextTypes: {
      intl: intlShape,
      ...childContextTypes,
    },
    wrappingComponent: IntlContextProvider,
    wrappingComponentProps: { intl: providers[locale] },
    ...additionalOptions,
  });

/**
 * Mounts a component wrapped with IntlContextProvider and ConfigProvider
 *
 * @param {React.Element} node - The component to mount
 * @param {object} options
 * @param {object} options.config - Config object for ConfigProvider
 * @param {string} [options.locale='en'] - Locale for intl
 */
export const mountWithProviders = (node, { config, locale = 'en' } = {}) => {
  const intl = providers[locale];
  return mount(
    <IntlProvider locale={locale} messages={translations[locale]}>
      <IntlContextProvider intl={intl}>
        <ConfigProvider value={config}>
          <ReactRelayContext.Provider value={mockRelayContext}>
            {node}
          </ReactRelayContext.Provider>
        </ConfigProvider>
      </IntlContextProvider>
    </IntlProvider>,
  );
};
