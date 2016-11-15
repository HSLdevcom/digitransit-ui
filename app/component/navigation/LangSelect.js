import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import config from '../../config';
import ComponentUsageExample from '../documentation/ComponentUsageExample';
import { setLanguage } from '../../action/userPreferencesActions';

const selectLanguage = (executeAction, lang) =>
  () => executeAction(setLanguage, lang);

const language = (lang, currentLanguage, highlight, executeAction) => (
  <div className="lang" key={lang}>
    <span
      id={`lang-${lang}`}
      className={(highlight && 'selected') || ''}
      onClick={selectLanguage(executeAction, lang)}
    >
      {lang}
    </span>
  </div>
);

const LangSelect = ({ currentLanguage }, { executeAction }) => (
  <div key="lang-select" className="lang-select">
    {config.availableLanguages.map(lang =>
      language(lang, currentLanguage, lang === currentLanguage, executeAction)
    )}
  </div>
);

LangSelect.description = () => (
  <div>
    <p>
      Language selection component, language selection comes from config.
    </p>
    <ComponentUsageExample description="">
      <div style={{ width: '200px', background: 'rgb(51, 51, 51)' }}>
        <LangSelect currentLanguage="en" />
      </div>
    </ComponentUsageExample>
  </div>);

LangSelect.propTypes = {
  currentLanguage: React.PropTypes.string.isRequired,
};

LangSelect.contextTypes = {
  executeAction: React.PropTypes.func.isRequired,
};

const connected = connectToStores(LangSelect, ['PreferencesStore'], context => ({
  currentLanguage: context.getStore('PreferencesStore').getLanguage(),
}));

export { connected as default, LangSelect as Component };
