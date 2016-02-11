React             = require 'react'
EndpointActions   = require '../../action/endpoint-actions'
ReactAutosuggest = require 'react-autosuggest'
config            = require '../../config'
sortBy            = require 'lodash/collection/sortBy'
XhrPromise        = require '../../util/xhr-promise.coffee'
SuggestionItem    = require './suggestion-item'

class SearchInput extends React.Component

#  @propTypes:
#    onSuggestionSelect: React.PropTypes.func.isRequired
#    items: React.PropTypes.array.isRequired

  @contextTypes:
    executeAction: React.PropTypes.func.isRequired
    getStore: React.PropTypes.func.isRequired

  constructor: (props) ->
    super(props)
    @state = "value": props.initialValue

  handleUpdateInputNow: (event) =>
    input = event.target.value

    console.log(input, @state?.value)
    if input == @state?.value
      return

    @setState "value": input

    geolocation = @context.getStore('PositionStore').getLocationState()
    if config.autoSuggest.locationAware && geolocation.hasLocation
      opts = Object.assign(text: input, config.searchParams, "focus.point.lat": geolocation.lat, "focus.point.lon": geolocation.lon)
    else
      opts = Object.assign(text: input, config.searchParams)

    XhrPromise.getJson(config.URL.PELIAS, opts).then (res) =>
      features = res.features

      if config.autoSuggest?
        features = sortBy(features,
          (feature) ->
            config.autoSuggest.sortOrder[feature.properties.layer] || config.autoSuggest.sortOther
        )
        @setState "suggestions": features

  currentItemSelected: (e, suggestion) =>
    item = suggestion.suggestion
    name = SuggestionItem.getName(item.properties)
    @props.onSuggestionSelected(name, item)

  render: =>
    <ReactAutosuggest
      className={@props.className}
      id="suggest"
      suggestions={@state?.suggestions || []}
      renderSuggestion={(item) ->
        <SuggestionItem item={item} spanClass="autosuggestIcon"/>}
      getSuggestionValue={(suggestion) ->
        SuggestionItem.getName(suggestion.properties)
      }
      onSuggestionSelected={@currentItemSelected}
      inputProps={
        "id": "autosuggest-input"
        "value": @state?.value || ""
        "onChange": @handleUpdateInputNow
        "autofocus": true
      }
    />

module.exports = SearchInput
