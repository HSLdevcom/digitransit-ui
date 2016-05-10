{IntlProvider, addLocaleData} = require 'react-intl'
connectToStores       = require 'fluxible-addons-react/connectToStores'

module.exports = connectToStores IntlProvider, ['PreferencesStore'], (context, props) ->
  language = context.getStore('PreferencesStore').getLanguage()
  addLocaleData require "react-intl/locale-data/" + language

  locale: language
  messages: props.translations[language]
