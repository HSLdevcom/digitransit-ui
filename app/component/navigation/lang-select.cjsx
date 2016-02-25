React   = require 'react'
intl    = require('react-intl')
config  = require('../../config')
UserPreferencesActions = require('../../action/user-preferences-actions')


PREFERENCES_STORE_NAME = 'PreferencesStore'
class LangSelect extends React.Component

  @contextTypes:
    executeAction: React.PropTypes.func.isRequired
    getStore: React.PropTypes.func.isRequired

  componentDidMount: ->
    @context.getStore(PREFERENCES_STORE_NAME).addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore(PREFERENCES_STORE_NAME).removeChangeListener @onChange

  onChange: (lang) =>
    @forceUpdate()

  selectLanguage: (lang) ->
    () =>
      @context.executeAction UserPreferencesActions.setLanguage, lang


  render: ->
    UserPreferencesStore = @context.getStore PREFERENCES_STORE_NAME
    #currentLanguage = 'sv'
    currentLanguage = UserPreferencesStore.getLanguage()
    <div key="foo" className="lang-select row">
      {config.availableLanguages.map (lang) => <div key={lang} className="small-3 lang"><a className={"selected" if currentLanguage is lang} onClick={@selectLanguage(lang)} href="#">{lang}</a></div>}
    </div>


module.exports = LangSelect
