React             = require 'react'
EndpointActions   = require '../../action/endpoint-actions'
ReactAutowhatever = (require 'react-autowhatever').default
config            = require '../../config'
{sortBy}          = require 'lodash/collection'
XhrPromise        = require '../../util/xhr-promise.coffee'
SuggestionItem    = require './suggestion-item'

class SearchInput extends React.Component

  constructor: (props) ->
    @state =
      focusedItemIndex: 0

  componentWillMount: =>
    @context.getStore('SearchStore').addChangeListener @onSearchChange

  componentWillUnmount: =>
    @context.getStore('SearchStore').removeChangeListener @onSearchChange

  onSearchChange: =>
    if @context.getStore('SearchStore').getPosition() != undefined
      @handleUpdateInputNow(target:
        value: @context.getStore('SearchStore').getPosition().address)

  @contextTypes:
    executeAction: React.PropTypes.func.isRequired
    getStore: React.PropTypes.func.isRequired

  handleOnMouseEnter: (event, eventProps) =>
    if typeof eventProps.itemIndex != 'undefined'
      @setState "focusedItemIndex": eventProps.itemIndex
      event.preventDefault()

  blur: () ->
    #hide safari keyboard
    @refs.autowhatever.refs.input.blur()

  handleOnKeyDown: (event, eventProps) =>

    if event.keyCode == 13 #enter selects current
      @currentItemSelected()
      @blur()
      event.preventDefault()

    if event.keyCode == 27 #esc clears
      return @handleUpdateInputNow(target:
        value: "")
      event.preventDefault()

    if (typeof eventProps.newFocusedItemIndex != 'undefined')
      @setState "focusedItemIndex": eventProps.newFocusedItemIndex,
        () -> document.getElementById("react-autowhatever-suggest--item-" + eventProps.newFocusedItemIndex)?.scrollIntoView(false)

      event.preventDefault()

  handleOnMouseDown: (event, eventProps) =>
    if typeof eventProps.itemIndex != 'undefined'
      @setState "focusedItemIndex": eventProps.itemIndex, () => @currentItemSelected()
      @blur()
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

    if input != undefined and input != null && input.trim() != ""
      XhrPromise.getJson(config.URL.PELIAS, opts).then (res) =>
        features = res.features

        if config.autoSuggest?
          features = sortBy(features,
            (feature) ->
              config.autoSuggest.sortOrder[feature.properties.layer] || config.autoSuggest.sortOther
          )
          @setState "suggestions": features, focusedItemIndex: 0
          () ->  if features.length > 0
            document.getElementById("react-autowhatever-suggest--item-0").scrollIntoView()

    else
      @setState "suggestions": [], focusedItemIndex: 0


  currentItemSelected: () =>
    if(@state.focusedItemIndex >= 0 and @state.suggestions.length > 0)
      item = @state.suggestions[@state.focusedItemIndex]
      name = SuggestionItem.getName(item.properties)
      @props.onSuggestionSelected(name, item)

  render: =>
    <ReactAutowhatever
      ref = "autowhatever"
      className={@props.className}
      id="suggest"
      items={@state?.suggestions || []}
      renderItem={(item) ->
        <SuggestionItem ref={item.name} item={item} spanClass="autosuggestIcon"/>}
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
        "placeholder": @context.getStore('SearchStore').getPlaceholder()
      }
      itemProps={
        "onMouseEnter": @handleOnMouseEnter
        "onMouseDown": @handleOnMouseDown
        "onMouseTouch": @handleOnMouseDown
      }
    />

module.exports = SearchInput
