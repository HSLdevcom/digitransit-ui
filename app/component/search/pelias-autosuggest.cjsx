React          = require 'react'
ReactAutosuggest = require 'react-autosuggest'
Icon           = require '../icon/icon'
XhrPromise     = require '../../util/xhr-promise.coffee'
config         = require '../../config'

AUTOSUGGEST_ID = 'autosuggest'

class Autosuggest extends React.Component

  getName: (suggestion) ->
    if suggestion.layer == 'address'
      "#{suggestion.street} #{suggestion.housenumber}, #{suggestion.locality}"
    else
      suggestion.label

  getSuggestions: (input, callback) ->
    XhrPromise.getJson(config.URL.PELIAS, text: input)
      .then (res) -> callback null, res.features

  renderSuggestions: (suggestion, input) =>
    value = @getName suggestion.properties
    firstMatchIndex = value.toLowerCase().indexOf(input.toLowerCase())
    lastMatchIndex = firstMatchIndex + input.length

    switch suggestion.properties.layer
      when 'address'
        icon = <Icon img="icon-icon_place"/>
      when 'stop'
        icon = <Icon img="icon-icon_bus-stop"/>
      when 'locality'
        icon = <Icon img="icon-icon_city"/>
      when 'localadmin'
        icon = <Icon img="icon-icon_city"/>
      when 'neighbourhood'
        icon = <Icon img="icon-icon_city"/>
      else
        icon = "*"

    # suggestion can match even if input text is not visible
    if firstMatchIndex == -1
      return (
        <span>
          {icon}
          {value}
        </span>
      )

    beforeMatch = value.slice(0, firstMatchIndex)
    match = value.slice(firstMatchIndex, lastMatchIndex)
    afterMatch = value.slice(lastMatchIndex, value.length)
    return (
      <span id={value}>
        {icon}
        {beforeMatch}
        <strong>{match}</strong>
        {afterMatch}
      </span>
    )

  suggestionValue: (suggestion) =>
    @getName suggestion.properties

  onSuggestionSelected: (suggestion, event) =>
    event.preventDefault()
    @props.onSelection(suggestion.geometry.coordinates[1],
                       suggestion.geometry.coordinates[0],
                       @getName suggestion.properties)

  # Happens when user presses enter without selecting anything from autosuggest
  onSubmit: (e) =>
    e.preventDefault()
    @getSuggestions @refs.input.state.value, (err, values) => @onSuggestionSelected values[0], e

  render: =>
    inputAttributes =
      id: AUTOSUGGEST_ID
      placeholder: @props.placeholder

    <form onSubmit={@onSubmit}>
      <ReactAutosuggest
        ref="input"
        suggestions={@getSuggestions}
        suggestionRenderer={@renderSuggestions}
        suggestionValue={@suggestionValue}
        defaultValue={@props.value}
        showWhen={(input) -> input.trim().length >= 2}
        onSuggestionSelected={@onSuggestionSelected}
        inputAttributes={
          placeholder: @props.placeholder
          #onBlur: @onSubmit Uh, causes a bug, as it is called after bluring the input after a selection has been done
        }
        id={@props.id}
        scrollBar={true}
      />
    </form>

module.exports = Autosuggest
