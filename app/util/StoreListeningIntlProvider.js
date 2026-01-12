import React from 'react';
import { IntlProvider, addLocaleData, injectIntl } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';
import PropTypes from 'prop-types';
import { IntlContextProvider } from './useTranslationsContext';

const ConnectedIntlProvider = connectToStores(
  IntlProvider,
  ['PreferencesStore'],
  (context, props) => {
    const language = context.getStore('PreferencesStore').getLanguage();
    // eslint-disable-next-line global-require, import/no-dynamic-require
    addLocaleData(require(`react-intl/locale-data/${language}`));
    return {
      locale: language,
      messages: props.translations[language],
    };
  },
);

const InjectedIntlContextProvider = injectIntl(({ intl, children }) => (
  <IntlContextProvider intl={intl}>{children}</IntlContextProvider>
));

const StoreListeningIntlProvider = props => {
  return (
    <ConnectedIntlProvider {...props}>
      <InjectedIntlContextProvider>
        {props.children}
      </InjectedIntlContextProvider>
    </ConnectedIntlProvider>
  );
};

StoreListeningIntlProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default StoreListeningIntlProvider;
