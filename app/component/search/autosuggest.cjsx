isBrowser      = window?
React          = require 'react'
AutosuggestPelias = require './pelias-autosuggest'
AutosuggestDigitransit = require './digitransit-autosuggest'

class Autosuggest extends React.Component
  constructor: ->
    super

  usePelias: ->
    if isBrowser == true and window.location.search.indexOf("pelias") > -1
      true
    else
      false

  render: ->
    if @usePelias()
      <AutosuggestPelias
        onSelection={@props.onSelection}
        placeholder={@props.placeholder}
        value={@props.value}
        id={@props.id}
        />
    else
      <AutosuggestDigitransit
        onSelection={@props.onSelection}
        placeholder={@props.placeholder}
        value={@props.value}
        id={@props.id}
        />

module.exports = Autosuggest
