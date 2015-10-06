isBrowser      = window?
React          = require 'react'
AutosuggestPelias = require './pelias-autosuggest'
AutosuggestDigitransit = require './digitransit-autosuggest'

class Autosuggest extends React.Component
  @contextTypes:
    location: React.PropTypes.object.isRequired

  usePelias: ->
    @context.location.query.hasOwnProperty('pelias')

  render: ->
    Autosuggest = if @usePelias() then AutosuggestPelias else AutosuggestDigitransit
    <Autosuggest
      onSelection={@props.onSelection}
      placeholder={@props.placeholder}
      value={@props.value}
      id={@props.id}
      />

module.exports = Autosuggest
