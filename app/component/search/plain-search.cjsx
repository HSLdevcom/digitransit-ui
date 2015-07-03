React          = require 'react'
Autosuggest    = require 'react-autosuggest'
Icon           = require '../icon/icon.cjsx'
XhrPromise     = require '../../util/xhr-promise.coffee'
config         = require '../../config'

AUTOSUGGEST_ID = 'autosuggest'

class PlainSearch extends React.Component
  propTypes =
    initialSelection: React.PropTypes.object
    inputAttributes: React.PropTypes.object
    onSelection: React.PropTypes.func.isRequired

  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    router: React.PropTypes.func.isRequired

  constructor: ->
    super
    # XXX This needs to be configurable
    @filterCities = ['Helsinki', 'Espoo', 'Kauniainen', 'Vantaa', 'Sipoo',
                     'Kirkkonummi']

  # input: what the user has typed to react-autosuggest component
  # callback: react-autosuggest function to call with results list
  getSuggestions: (input, callback) =>
    # Save this so we can do multistep autocomplete and return suggestions
    # even when react-autosuggest doesn't ask for them
    @suggestionCallback = callback
    analyzed = @analyzeInput(input)
    if analyzed.isAddressSearch && analyzed.queryCity
      @searchAddresses(analyzed.queryCity, analyzed.queryAddress, analyzed.queryNumber, callback)
    else
      @searchSuggests(analyzed.queryAddress, callback)

  analyzeInput: (input) =>
    containsComma = input.lastIndexOf(',') > -1
    containsSpace = input.lastIndexOf(' ') > -1
    isLastCharSpace =  /\s+$/.test(input)
    isNumbersInQuery = if input.match(/\d/) then true else false
    isStopCodeSearch = isNumbersInQuery and not containsSpace
    isAddressSearch = (isNumbersInQuery or isLastCharSpace) and not isStopCodeSearch
    if containsComma  # Try to find city
      # XXX This removes simple unit numbers, but not kiinteistönjakokirjain
      address = input.substring(0, input.lastIndexOf(',')).replace(/\d+/g,'').trim()
      city = input.substring(input.lastIndexOf(',')+1, input.length).trim()
      number = if isNumbersInQuery then input.match(/\d+/)[0] else null
    else if isStopCodeSearch
      # XXX There's no way to search for a stop within a given city
      address = input.trim()
    else
      # This is address
      address = input.replace(/\d+/g,'').trim()
      number = if isNumbersInQuery then input.match(/\d+/)[0] else null

    return {
      isValidSearch: input.trim().length > 0
      isLastCharSpace: isLastCharSpace
      isNumbersInQuery: isNumbersInQuery
      isAddressSearch: isAddressSearch
      query: input
      queryCity: city
      queryAddress: address
      queryNumber: number
    }

  # Search for precise addresses on a given street in given city
  # and call a react-autosuggest callback with the results
  searchAddresses: (city, address, number, callback) ->
    numberRegex = if number then new RegExp("^" + number) else /.*/
    XhrPromise.getJson(config.URL.GEOCODER + "street/#{city}/#{address}")
      .then (data) ->
        addresses = []
        for address in data.results
          if numberRegex.test(parseInt(address.number))
            # XXX What happens if we don't find any matching numbers?
            staircaseSelection = if address.unit? then address.unit else ""
            addresses.push
              'type': 'address'
              'address': address.streetFi  # TODO Swedish names here too
              'lat': address.location[1]
              'lon': address.location[0]
              'number': if address.number isnt 0 then address.number else ''
              'staircase': address.unit
              'city': address.municipalityFi  # TODO Swedish names here too
              'description': "#{address.streetFi} #{address.number}#{staircaseSelection}, #{address.municipalityFi}"
        callback(null, addresses)

  # Search for fuzzy matches
  # and call a react-autosuggest callback with the results
  searchSuggests: (address, callback) =>
    XhrPromise.getJson(
      config.URL.GEOCODER +
      # XXX Test if this work with no prop given
      "suggest/#{address}?" + @filterCities.join('&'))
      .then (data) =>
        streets = []
        for street in data.streetnames_fi
          for streetName, cities of street
            for city in cities
              streets.push
                'type': 'street'
                'address': "#{streetName}"
                'city': "#{city.key}"
                'description': "#{streetName}, #{city.key}"

        stops = data.stops.map (result) ->
          'type': 'stop'
          'address': result.nameFi
          'city': result.municipalityFi
          'lat': result.location[1]
          'lon': result.location[0]
          'stopCode': result.stopCode
          'description': "#{result.nameFi} (#{result.stopCode}), #{result.municipalityFi}"

        if streets.length == 1 and stops.length == 0
          # We can directly do address search
          @searchAddresses(streets[0].city, streets[0].address, null, callback)
        else
          # Show streets and stops
          callback(null, streets.concat(stops))

  renderSuggestion: (suggestion, input) ->
    value = suggestion.description
    reqex = new RegExp('\\b' + value, 'i')
    firstMatchIndex = value.toLowerCase().indexOf(input.toLowerCase())
    lastMatchIndex = firstMatchIndex + input.length

    switch suggestion.type
      when 'street' then icon = """<svg viewBox="0 0 40 40" class="icon"><use xlink:href="#icon-icon_place"></use></svg>"""
      when 'address' then icon = """<svg viewBox="0 0 40 40" class="icon"><use xlink:href="#icon-icon_place"></use></svg>"""
      when 'stop' then icon = """<svg viewBox="0 0 40 40" class="icon"><use xlink:href="#icon-icon_bus-stop"></use></svg>"""
      else icon = "<span>*</span>"

    # suggestion can match even if input text is not visible
    if firstMatchIndex == -1
      return (
        <span>
          <span dangerouslySetInnerHTML={__html: icon}/>
          {value}
        </span>
      )

    beforeMatch = value.slice(0, firstMatchIndex)
    match = value.slice(firstMatchIndex, lastMatchIndex)
    afterMatch = value.slice(lastMatchIndex, value.length)
    return (
      <span id={value}>
        <span dangerouslySetInnerHTML={__html: icon}/>
        {beforeMatch}
        <strong>{match}</strong>
        {afterMatch}
      </span>
    )

  # When user selects something in react-autosuggest,
  # this function is called to get the new string content of the input field
  # XXX setSelectionRange
  suggestionValue: (suggestion) ->
    return suggestion.description

  suggestionSelected: (suggestion, e) =>
    # Prevent default so that form submit will not happen in this case
    e.preventDefault()
    @setState suggestion
    if suggestion.type is 'street'
      @searchAddresses(suggestion.city, suggestion.address, null, @suggestionCallback)
    else
      # We have coordinates - inform parent
      @props.onSelection(suggestion)

  # This will get autosuggestComponent when it mounts
  # See: https://github.com/moroshko/react-autosuggest/issues/21
  handleAutosuggestMount: (autosuggestComponent) =>
    if autosuggestComponent
      input = autosuggestComponent.refs.input.getDOMNode()
      input.addEventListener('keydown', @suggestionArrowPress)
      @autosuggestInput = input

  # Scroll selection if needed
  # See: https://github.com/moroshko/react-autosuggest/issues/21
  suggestionArrowPress: (e) =>
    if e.which isnt 38 and e.which isnt 40
      return

    suggestions = document.getElementsByClassName(
      "react-autosuggest__suggestion--focused")
    if suggestions.length is 0
      return
    selectedSuggestion = suggestions[0]

    autosuggestDivs = document.getElementsByClassName(
      "react-autosuggest__suggestions")
    if autosuggestDivs.length == 0 then return
    autosuggestDiv = autosuggestDivs[0]

    if e.which is 38
      # Up
      autosuggestDiv.scrollTop = selectedSuggestion.offsetTop - 90
    else if e.which is 40
      # Down
      autosuggestDiv.scrollTop = selectedSuggestion.offsetTop - 60

  # Happens when user presses enter without selecting anything from autosuggest
  onSubmit: (e) =>
    e.preventDefault()

  render: =>
    <form onSubmit={@onSubmit}>
      <Autosuggest
        ref={@handleAutosuggestMount}
        inputAttributes={@props.inputAttributes}
        value={@props.value}
        suggestions={@getSuggestions}
        suggestionRenderer={@renderSuggestion}
        suggestionValue={@suggestionValue}
        onSuggestionSelected={@suggestionSelected}
        showWhen={(input) => input.trim().length >= 2}/>
    </form>

module.exports = PlainSearch
