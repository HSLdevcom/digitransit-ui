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
import translations from '../../../app/translations';

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
    context: Object.assign({}, context, { intl: providers[locale] }),
    ...additionalOptions,
  });

export const mountWithIntl = (
  node,
  { context, childContextTypes, ...additionalOptions } = {},
  locale = 'en',
) =>
  mount(nodeWithIntlProp(node, locale), {
    context: Object.assign({}, context, { intl: providers[locale] }),
    childContextTypes: Object.assign(
      {},
      { intl: intlShape },
      childContextTypes,
    ),
    ...additionalOptions,
  });
