React   = require 'react'
intl    = require('react-intl')
config  = require('../../config')
UserPreferencesActions = require('../../action/user-preferences-actions')
connectToStores       = require 'fluxible-addons-react/connectToStores'

PREFERENCES_STORE_NAME = 'PreferencesStore'

selectLanguage = (executeAction, lang) -> -> executeAction UserPreferencesActions.setLanguage, lang

Language = ({lang, currentLanguage}, {executeAction}) ->
  <div className="lang">
    <a
      className={"selected" if currentLanguage is lang}
      onClick={selectLanguage(executeAction, lang)}
      href="#"
    >
      {lang}
    </a>
  </div>

Language.contextTypes =
  executeAction: React.PropTypes.func.isRequired

LangSelect = ({currentLanguage}) ->
  <div key="foo" className="lang-select row">
    {config.availableLanguages.map (lang) => <Language lang={lang} currentLanguage={currentLanguage} key={lang}/>}
  </div>

module.exports = connectToStores LangSelect, [PREFERENCES_STORE_NAME], (context, props) ->
  currentLanguage: context.getStore(PREFERENCES_STORE_NAME).getLanguage()
