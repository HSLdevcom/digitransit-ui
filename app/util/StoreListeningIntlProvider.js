import { IntlProvider, addLocaleData } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';

export default connectToStores(
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
