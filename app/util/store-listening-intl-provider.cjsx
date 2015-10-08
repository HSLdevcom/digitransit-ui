React        = require 'react'
IntlProvider = require('react-intl').IntlProvider


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
    children = @props.children;

    <IntlProvider messages={@props.translations[@context.getStore('PreferencesStore').getLanguage()]} locale={@context.getStore('PreferencesStore').getLanguage()}>
      {children}
    </IntlProvider>


module.exports = StoreListeningIntlProvider
