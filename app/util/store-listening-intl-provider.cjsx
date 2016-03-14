React             = require 'react'
IntlProvider      = require('react-intl').IntlProvider
{addLocaleData}   = require 'react-intl'


class StoreListeningIntlProvider extends React.Component

  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  componentDidMount: ->
    @context.getStore('PreferencesStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('PreferencesStore').removeChangeListener @onChange

  onChange: (id) =>
    @forceUpdate()

  render: ->
    children = @props.children
    language = @context.getStore('PreferencesStore').getLanguage()
    addLocaleData require "react-intl/lib/locale-data/" + language
    <IntlProvider messages={@props.translations[language]} locale={language}>
      {children}
    </IntlProvider>


module.exports = StoreListeningIntlProvider
