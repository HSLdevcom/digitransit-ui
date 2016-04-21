React             = require 'react'
ReactAutowhatever = (require 'react-autowhatever').default
SuggestionItem    = require './suggestion-item'
SearchActions     = require '../../action/search-actions'
isBrowser         = window?
L                 = if isBrowser then require 'leaflet' else null

class SearchInput extends React.Component

  constructor: (props) ->
    @state =
      focusedItemIndex: 0

  focusItem = (i) ->
    if L.Browser.touch
      return
    document.getElementById("react-autowhatever-suggest--item-" + i)?.scrollIntoView(false)

  @contextTypes:
    executeAction: React.PropTypes.func.isRequired
    getStore: React.PropTypes.func.isRequired

  @propTypes:
    type: React.PropTypes.string.isRequired

  componentWillMount: =>
    @context.getStore('SearchStore').addChangeListener @onSearchChange

  componentWillUnmount: =>
    @context.getStore('SearchStore').removeChangeListener @onSearchChange

  onSearchChange: (props) =>
    @setState "suggestions": @context.getStore('SearchStore').getSuggestions(), focusedItemIndex: 0,
      () => focusItem(0)

  handleOnMouseEnter: (event, eventProps) =>
    if typeof eventProps.itemIndex != 'undefined'
      if eventProps.itemIndex != @state.focusedItemIndex
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
      if @state.value == ""
        @context.executeAction SearchActions.closeSearch
      else return @handleUpdateInputNow(target:
        value: "")
      event.preventDefault()

    if (typeof eventProps.newFocusedItemIndex != 'undefined')
      @setState "focusedItemIndex": eventProps.newFocusedItemIndex,
        () -> focusItem(eventProps.newFocusedItemIndex)

      event.preventDefault()

  handleOnMouseDown: (event, eventProps) =>
    if typeof eventProps.itemIndex != 'undefined'
      @setState "focusedItemIndex": eventProps.itemIndex, () => @currentItemSelected()
      @blur()
      event.preventDefault()

  handleOnTouchStart: (event, eventProps) =>
    @blur()

  handleUpdateInputNow: (event) =>
    input = event.target.value

    if input == @state?.value
      return

    @setState "value": input
    @context.executeAction SearchActions.executeSearch, input: event.target.value, type: @props.type

  currentItemSelected: () =>
    if(@state.focusedItemIndex >= 0 and @state.suggestions.length > 0)
      item = @state.suggestions[@state.focusedItemIndex]
      name = SuggestionItem.getName item.properties

      if item.type == "CurrentLocation"
        state = @context.getStore('PositionStore').getLocationState()
        item.geometry = coordinates: [state.lon, state.lat]
        name = "Nykyinen sijainti"
      else
        save = () =>
          @context.executeAction SearchActions.saveSearch,
            "address": name
            "geometry": item.geometry
            "type": @props.type
        setTimeout save, 0

      @props.onSuggestionSelected(name, item)

      @setState
        value: name

  render: =>
    <ReactAutowhatever
      ref = "autowhatever"
      className={@props.className}
      id="suggest"
      items={@state?.suggestions || []}
      renderItem={(item) ->
        <SuggestionItem ref={item.name} item={item} spanClass="autosuggestIcon"/>}
      onSuggestionSelected={@currentItemSelected}
      focusedItemIndex={@state.focusedItemIndex}
      inputProps={
        "id": @props.id
        "value": if @state.value?.length >= 0 then @state?.value else @props.initialValue
        "onChange": @handleUpdateInputNow
        "onKeyDown": @handleOnKeyDown
        "onTouchStart": @handleOnTouchStart
      }
      itemProps={
        "onMouseEnter": @handleOnMouseEnter
        "onMouseDown": @handleOnMouseDown
        "onMouseTouch": @handleOnMouseDown
        "onTouchStart": @handleOnTouchStart
      }
    />

module.exports = SearchInput
