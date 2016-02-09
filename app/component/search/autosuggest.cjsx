React          = require 'react'
ReactAutosuggest = require 'react-autosuggest'
Icon           = require '../icon/icon'
XhrPromise     = require '../../util/xhr-promise.coffee'
config         = require '../../config'
sortBy         = require 'lodash/collection/sortBy'
L              = if window? then require 'leaflet' else null
SuggestionItem = require './suggestion-item'

AUTOSUGGEST_ID = 'autosuggest'

class Autosuggest extends React.Component
  @contextTypes:
    executeAction: React.PropTypes.func.isRequired
    getStore: React.PropTypes.func.isRequired

  @propTypes:
    onSelectionAction: React.PropTypes.func.isRequired
    placeholder: React.PropTypes.string.isRequired
    disableInput: React.PropTypes.func.isRequired
    onEmpty: React.PropTypes.func.isRequired
    id: React.PropTypes.string.isRequired
    focus: React.PropTypes.func.isRequired

  getSuggestions: (input, callback) =>
    geolocation = @context.getStore('PositionStore').getLocationState()
    if config.autoSuggest.locationAware && geolocation.hasLocation
      opts = Object.assign(text: input, config.searchParams, "focus.point.lat": geolocation.lat, "focus.point.lon": geolocation.lon)
    else
      opts = Object.assign(text: input, config.searchParams)

    XhrPromise.getJson(config.URL.PELIAS, opts).then (res) ->
      features = res.features

      if config.autoSuggest?
        features = sortBy(features,
          (feature) ->
            config.autoSuggest.sortOrder[feature.properties.layer] || config.autoSuggest.sortOther
          )
      callback null, features

  componentDidMount: =>
    if (@refs.input.refs.input.value == "" and !L.Browser.touch)
      @focusInput()

  focusInput: ->
    if(@refs.input.refs.input)
      @refs.input.refs.input.focus()

  suggestionValue: (suggestion) =>
    @getName suggestion.properties

  onSuggestionSelected: (suggestion, event) =>
    @context.executeAction @props.onSelectionAction,
      lat: suggestion.geometry.coordinates[1]
      lon: suggestion.geometry.coordinates[0],
      address: @getName suggestion.properties

  # Happens when user presses enter without selecting anything from autosuggest
  onSubmit: (e) =>
    e.preventDefault()
    @getSuggestions @refs.input.state.value, (err, values) => @onSuggestionSelected values[0], e

  render: =>
    inputAttributes =
      placeholder: @props.placeholder
      onBlur: @props.disableInput

    <form id={@props.id} onSubmit={@onSubmit}>
      <ReactAutosuggest
        ref="input"
        suggestions={@getSuggestions}
        suggestionRenderer={(item)-><SuggestionItem item={item}/>}
        suggestionValue={@suggestionValue}
        defaultValue={@props.value}
        showWhen={(input) =>
          # This a dirty hack to do two things:
          # 1) we start showing results after 2 characters (this one is ok)
          # 2) when we notice that everything is cleared, we remove location from flux store (not ok)
          # react-autosuggest should support second case, but it currently doesn't
          if input == ""
            @props.onEmpty()
          input.trim().length >= 2
        }
        onSuggestionSelected={@onSuggestionSelected}
        inputAttributes = {inputAttributes}
        scrollBar={true}
      />
    </form>

module.exports = Autosuggest
