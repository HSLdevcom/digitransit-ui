import React from 'react';
import config from '../../config';
import UserPreferencesActions from '../../action/user-preferences-actions';
import connectToStores from 'fluxible-addons-react/connectToStores';

const selectLanguage = (executeAction, lang) =>
  () => executeAction(UserPreferencesActions.setLanguage, lang);

const language = (lang, currentLanguage, highlight, executeAction) => (
  <div className="lang" key={lang}>
    <span
      className={highlight ? 'selected' : void 0}
      onClick={selectLanguage(executeAction, lang)}
    >
      {lang}
    </span>
  </div>
);

const LangSelect = ({ currentLanguage }, { executeAction }) => (
  <div key="lang-select" className="lang-select row">
    {config.availableLanguages.map(lang =>
      language(lang, currentLanguage, lang === currentLanguage, executeAction)
    )}
  </div>
);

LangSelect.propTypes = {
  currentLanguage: React.PropTypes.string.isRequired,
};

LangSelect.contextTypes = {
  executeAction: React.PropTypes.func.isRequired,
};

export default connectToStores(LangSelect, ['PreferencesStore'], (context) => ({
  currentLanguage: context.getStore('PreferencesStore').getLanguage(),
}));
