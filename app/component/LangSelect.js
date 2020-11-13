import PropTypes from 'prop-types';
import React from 'react';
import { matchShape, routerShape } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import moment from 'moment';
import { save } from 'react-cookie';
import ComponentUsageExample from './ComponentUsageExample';
import { setLanguage } from '../action/userPreferencesActions';
import { isBrowser } from '../util/browser';
import { replaceQueryParams } from '../util/queryUtils';
import { addAnalyticsEvent } from '../util/analyticsUtils';

const selectLanguage = (executeAction, lang, router, match) => () => {
  addAnalyticsEvent({
    category: 'Navigation',
    action: 'ChangeLanguage',
    name: lang,
  });
  executeAction(setLanguage, lang);
  // save cookie
  save('lang', lang);
  if (lang !== 'en') {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    require(`moment/locale/${lang}`);
  }
  moment.locale(lang);
  replaceQueryParams(router, match, { locale: lang });
  window.location.reload();
};

const language = (lang, highlight, executeAction, router, match) => (
  <button
    id={`lang-${lang}`}
    key={lang}
    className={`${(highlight && 'selected') || ''} noborder lang`}
    onClick={selectLanguage(executeAction, lang, router, match)}
  >
    {lang}
  </button>
);

const LangSelect = (
  { currentLanguage },
  { executeAction, config, router, match },
) => {
  if (isBrowser) {
    return (
      <div key="lang-select" id="lang-select">
        {config.availableLanguages.map(lang =>
          language(
            lang,
            lang === currentLanguage,
            executeAction,
            router,
            match,
          ),
        )}
      </div>
    );
  }
  return null;
};

LangSelect.displayName = 'LangSelect';

LangSelect.description = () => (
  <div>
    <p>Language selection component, language selection comes from config.</p>
    <ComponentUsageExample description="">
      <div style={{ width: '200px', background: 'rgb(51, 51, 51)' }}>
        <LangSelect currentLanguage="en" />
      </div>
    </ComponentUsageExample>
  </div>
);

LangSelect.propTypes = {
  currentLanguage: PropTypes.string.isRequired,
};

LangSelect.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
  router: routerShape.isRequired,
  match: matchShape.isRequired,
};

const connected = connectToStores(
  LangSelect,
  ['PreferencesStore'],
  context => ({
    currentLanguage: context.getStore('PreferencesStore').getLanguage(),
  }),
);

export { connected as default, LangSelect as Component, selectLanguage };
