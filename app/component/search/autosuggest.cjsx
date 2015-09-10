isBrowser      = window?
React          = require 'react'
ReactAutosuggest    = require 'react-autosuggest'
XhrPromise     = require '../../util/xhr-promise.coffee'
config         = require '../../config'

AUTOSUGGEST_ID = 'autosuggest'

class Autosuggest extends React.Component

  @contextTypes:
    router: React.PropTypes.func.isRequired

  constructor: ->
    super

  analyzeInput: (input) =>
    containsComma = input.lastIndexOf(',') > -1
    containsSpace = input.lastIndexOf(' ') > -1
    isLastCharSpace =  /\s+$/.test(input)
    isNumbersInQuery = if input.match(/\d/) then true else false
    isStopCodeSearch = isNumbersInQuery and not containsSpace
    isAddressSearch = (isNumbersInQuery or isLastCharSpace) and not isStopCodeSearch
    cities = []
    if containsComma
      # Try to find city
      address = input.substring(0, input.lastIndexOf(',')).replace(/\d+/g, '').trim()
      city = input.substring(input.lastIndexOf(',') + 1, input.length).trim()
      number = if isNumbersInQuery then input.match(/\d+/)[0] else null
      if city.length > 0
        cities.push(city.toLowerCase())
    else if isStopCodeSearch
      address = input.trim()
    else
      # This is address
      address = input.replace(/\d+/g, '').trim()
      number = if isNumbersInQuery then input.match(/\d+/)[0] else null

    return {
      isValidSearch: input.trim().length > 0
      isLastCharSpace: isLastCharSpace
      isNumbersInQuery: isNumbersInQuery
      isAddressSearch: isAddressSearch
      query: input
      queryCities: cities
      queryAddress: address
      queryNumber: number
    }

  findLocation: (cities, address, number) =>
    # We need to have city information available when finding location
    if not cities or cities.length == 0
      console.log("Cannot find location without city information")
      return

    # Construct urls for all cities depending whether we have a number present or not
    urls = cities.map((city) ->
      if number
        config.URL.GEOCODER + "address/#{city}/#{address}/#{number}"
      else
        config.URL.GEOCODER + "street/#{city}/#{address}"
    )

    # Query all constructed urls for address and hope to find hits from one city
    XhrPromise.getJsons(urls).then (cityResults) =>
      foundLocations = []
      for data in cityResults
        if data.results.length > 0
          # We store first hit. this means search without address is same as "address 1"
          foundLocations.push(data.results[0])

      if foundLocations.length == 1
        # TODO, handle Swedish names too at some point
        if number
          addressString = "#{address} #{number}, #{foundLocations[0].municipalityFi}"
        else
          addressString = "#{address} #{foundLocations[0].number}, " +
                          "#{foundLocations[0].municipalityFi}"
        @props.onSelection(foundLocations[0].location[1],
                           foundLocations[0].location[0],
                           addressString)
      else if foundLocations.length > 1
        console.log("Query #{address}, #{number}, #{cities}" +
                    "returns results from more than 1 city. Cannot set location.")
      else
        console.log("Cannot find any locations with #{address}, #{number}, #{cities}")

  getSuggestions: (input, callback) =>
    analyzed = @analyzeInput(input)
    if analyzed.isAddressSearch && analyzed.queryCities.length > 0
      @searchAddresses(analyzed.queryCities, analyzed.queryAddress, analyzed.queryNumber, callback)
    else
      @searchSuggests(analyzed.queryAddress, callback)

  searchAddresses: (cities, address, number, callback) ->
    numberRegex = if number then new RegExp("^" + number) else /.*/
    urls = cities.map (city) ->
      config.URL.GEOCODER + "street/#{city}/#{address}"

    XhrPromise.getJsons(urls).then (cityResults) ->
      addresses = []
      for data in cityResults
        for address in data.results
          if numberRegex.test(parseInt(address.number))
            staircaseSelection = if address.unit? then address.unit else ""
            addresses.push
              'type': 'address'
              'address': address.streetFi  # TODO Swedish names here too
              'lat': address.location[1]
              'lon': address.location[0]
              'number': address.number
              'staircase': address.unit
              'city': address.municipalityFi  # TODO Swedish names here too
              'selection': "#{address.streetFi} #{address.number}#{staircaseSelection}, " +
                           "#{address.municipalityFi}"
      callback(null, addresses)

  searchSuggests: (address, callback) =>
    options = if config.cities then {city: config.cities} else undefined
    XhrPromise.getJson(config.URL.GEOCODER + "suggest/#{address}", options).then (data) =>
      streets = []
      uniqueCities = []
      for street in data.streetnames_fi
        for streetName, cities of street
          for city in cities
            streets.push
              'type': 'street'
              'address': "#{streetName}"
              'city': "#{city.key}"
              'selection': "#{streetName}, #{city.key}"

            # Store all city names for address search where address is exact match
            if (city.key.toLowerCase() not in uniqueCities and
                streetName.toLowerCase() == address.toLowerCase())
              uniqueCities.push(city.key.toLowerCase())

      stops = data.stops.map (result) ->
        'type': 'stop'
        'address': result.nameFi
        'city': result.municipalityFi
        'lat': result.location[1]
        'lon': result.location[0]
        'stopCode': result.stopCode
        'selection': "#{result.nameFi} (#{result.stopCode}), #{result.municipalityFi}"

      if streets.length == 1 and stops.length == 0
        # We can directly do address search
        @searchAddresses([streets[0].city], streets[0].address, null, callback)
      else
        # We just show results
        all = streets.concat stops
        callback(null, all)

  renderSuggestion: (suggestion, input) ->
    value = suggestion.selection
    firstMatchIndex = value.toLowerCase().indexOf(input.toLowerCase())
    lastMatchIndex = firstMatchIndex + input.length

    switch suggestion.type
      when 'street'
        icon = '<svg viewBox="0 0 40 40" class="icon">' +
                 '<use xlink:href="#icon-icon_place"></use></svg>'
      when 'address'
        icon = '<svg viewBox="0 0 40 40" class="icon">' +
                 '<use xlink:href="#icon-icon_place"></use></svg>'
      when 'stop'
        icon = '<svg viewBox="0 0 40 40" class="icon">' +
                 '<use xlink:href="#icon-icon_bus-stop"></use></svg>'
      else
        icon = "<span>*</span>"

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

  suggestionValue: (suggestion) ->
    return suggestion.selection

  suggestionSelected: (suggestion, e) =>
    # Prevent default so that form submit will not happen in this case
    e.preventDefault()
    if suggestion.lat != undefined and suggestion.lon != undefined
      @props.onSelection(suggestion.lat, suggestion.lon, suggestion.selection)
    else
      analyzed = @analyzeInput(suggestion.selection)
      @findLocation(analyzed.queryCities, analyzed.queryAddress, analyzed.queryNumber)

  # This will get autoSuggestComponent when it mounts
  # See: https://github.com/moroshko/react-autosuggest/issues/21
  handleAutoSuggestMount: (autoSuggestComponent) =>
    if autoSuggestComponent
      input = autoSuggestComponent.refs.input.getDOMNode()
      input.addEventListener('keydown', @suggestionArrowPress)
      @autoSuggestInput = input

  # Scroll selection if needed
  # See: https://github.com/moroshko/react-autosuggest/issues/21
  suggestionArrowPress: (e) =>
    if e.which != 38 and e.which != 40
      return

    suggestions = document.getElementsByClassName("react-autosuggest__suggestion--focused")
    if suggestions.length == 0 then return
    selectedSuggestion = suggestions[0]

    autoSuggestDivs = document.getElementsByClassName("react-autosuggest__suggestions")
    if autoSuggestDivs.length == 0 then return
    autoSuggestDiv = autoSuggestDivs[0]

    if e.which == 38
      # Up
      autoSuggestDiv.scrollTop = selectedSuggestion.offsetTop - 90
    else if e.which == 40
      # Down
      autoSuggestDiv.scrollTop = selectedSuggestion.offsetTop - 60

  # Happens when user presses enter without selecting anything from autosuggest
  onSubmit: (e) =>
    e.preventDefault()
    analyzed = @analyzeInput(@autoSuggestInput.value)
    @findLocation(analyzed.queryCities, analyzed.queryAddress, analyzed.queryNumber)

  # We use two different components depending on location state
  # this way we can prevent autosuggest from keeping selected value as state
  render: =>
    inputAttributes =
      id: AUTOSUGGEST_ID
      placeholder: @props.placeholder

    <ReactAutosuggest
      ref={@handleAutoSuggestMount}
      inputAttributes={inputAttributes}
      value={@props.value}
      suggestions={@getSuggestions}
      suggestionRenderer={@renderSuggestion}
      suggestionValue={@suggestionValue}
      onSuggestionSelected={@suggestionSelected}
      showWhen={(input) => input.trim().length >= 2}
      scrollBar={true}/>

module.exports = Autosuggest
