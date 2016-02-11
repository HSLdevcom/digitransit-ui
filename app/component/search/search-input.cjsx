React             = require 'react'
EndpointActions   = require '../../action/endpoint-actions'
ReactAutowhatever = (require 'react-autowhatever').default
config            = require '../../config'
{sortBy}          = require 'lodash/collection'
XhrPromise        = require '../../util/xhr-promise.coffee'
SuggestionItem    = require './suggestion-item'

class SearchInput extends React.Component

  @contextTypes:
    executeAction: React.PropTypes.func.isRequired
    getStore: React.PropTypes.func.isRequired

  constructor: (props) ->
    super(props)
    @state = value: props.initialValue, focusedItemIndex: 0

  handleOnMouseEnter: (event, eventProps) =>
    if typeof eventProps.itemIndex != 'undefined'
      @setState "focusedItemIndex": eventProps.itemIndex
      event.preventDefault()

  handleOnKeyDown: (event, eventProps) =>
    if event.keyCode == 13 #enter selects current
      @currentItemSelected()
      event.preventDefault()

    if event.keyCode == 27 #esc clears
      return @handleUpdateInputNow(target:
        value: "")
      event.preventDefault()

    if (typeof eventProps.newFocusedItemIndex != 'undefined')
      @setState "focusedItemIndex": eventProps.newFocusedItemIndex
      event.preventDefault()

  handleOnMouseDown: (event, eventProps) =>
    console.log(eventProps)
    if typeof eventProps.itemIndex != 'undefined'
      @setState "focusedItemIndex": eventProps.itemIndex, () => @currentItemSelected()
      event.preventDefault()

  handleUpdateInputNow: (event) =>
    input = event.target.value

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

  currentItemSelected: () =>
    if(@state.focusedItemIndex >= 0 and @state.suggestions.length > 0)
      item = @state.suggestions[@state.focusedItemIndex]
      name = SuggestionItem.getName(item.properties)
      @props.onSuggestionSelected(name, item)
    else
      console.log("could not select:", @state.focusedItemIndex, @state.focusedItemIndex )

  render: =>
    <ReactAutowhatever
      ref = "foo"
      className={@props.className}
      id="suggest"
      items={@state?.suggestions || []}
      renderItem={(item) ->
        <SuggestionItem item={item} spanClass="autosuggestIcon"/>}
      getSuggestionValue={(suggestion) ->
        SuggestionItem.getName(suggestion.properties)
      }
      onSuggestionSelected={@currentItemSelected}
      focusedItemIndex={@state.focusedItemIndex}
      inputProps={
        "id": "autosuggest-input"
        "value": @state?.value || ""
        "onChange": @handleUpdateInputNow
        "onKeyDown": @handleOnKeyDown
        "autofocus": true
      }
      itemProps={
        "onMouseEnter": @handleOnMouseEnter
        "onMouseDown": @handleOnMouseDown
        "onMouseTouch": @handleOnMouseDown
      }
    />

module.exports = SearchInput
