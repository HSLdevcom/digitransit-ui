import PropTypes from 'prop-types';
import React from 'react';
import { routerShape } from 'react-router';
import connectToStores from 'fluxible-addons-react/connectToStores';
import moment from 'moment';
import ComponentUsageExample from './ComponentUsageExample';
import { setLanguage } from '../action/userPreferencesActions';
import { isBrowser } from '../util/browser';
import { replaceQueryParams } from '../util/queryUtils';
import { addAnalyticsEvent } from '../util/analyticsUtils';

const selectLanguage = (executeAction, lang, router) => () => {
  addAnalyticsEvent({
    category: 'Navigation',
    action: 'ChangeLanguage',
    name: lang,
  });
  executeAction(setLanguage, lang);
  if (lang !== 'en') {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    require(`moment/locale/${lang}`);
  }
  moment.locale(lang);
  replaceQueryParams(router, { locale: lang });
};

const language = (lang, currentLanguage, highlight, executeAction, router) => (
  <button
    id={`lang-${lang}`}
    key={lang}
    className={`${(highlight && 'selected') || ''} noborder lang`}
    onClick={selectLanguage(executeAction, lang, router)}
  >
    {lang}
  </button>
);

const LangSelect = ({ currentLanguage }, { executeAction, config, router }) => {
  if (isBrowser) {
    return (
      <div key="lang-select" id="lang-select">
        {config.availableLanguages.map(lang =>
          language(
            lang,
            currentLanguage,
            lang === currentLanguage,
            executeAction,
            router,
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
};

const connected = connectToStores(
  LangSelect,
  ['PreferencesStore'],
  context => ({
    currentLanguage: context.getStore('PreferencesStore').getLanguage(),
  }),
);

export { connected as default, LangSelect as Component, selectLanguage };
