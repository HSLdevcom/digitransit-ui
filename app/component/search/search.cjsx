isBrowser      = window?
React          = require 'react'
Autosuggest    = require 'react-autosuggest'
LocateActions  = require '../../action/locate-actions.coffee'
Icon           = require '../icon/icon.cjsx'
XhrPromise     = require '../../util/xhr-promise.coffee'

AUTOSUGGEST_ID = 'autosuggest'

class Search extends React.Component

  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    router: React.PropTypes.func.isRequired

  constructor: -> 
    super
  
  componentWillMount: =>
    @context.getStore('LocationStore').addChangeListener @onChange
    @setState @context.getStore('LocationStore').getLocationState()

  componentWillUnmount: =>
    @context.getStore('LocationStore').removeChangeListener @onChange

  onChange: =>
    @setState @context.getStore('LocationStore').getLocationState()    

  analyzeInput: (input) =>
    isLastCharSpace =  /\s+$/.test(input)
    isNumbersInQuery = input.match(/\d/)
    containsComma = input.lastIndexOf(',') > -1
    cities = []
    if containsComma 
      address = input.substring(0, input.lastIndexOf(',')).replace(/\d+/g,'').trim()
      city = input.substring(input.lastIndexOf(',')+1, input.length).trim()
      if city.length > 0
        cities.push(city.toLowerCase()) 
    else 
      address = input.replace(/\d+/g,'').trim()
    
    # Use previous cities only if not already set
    if @state and cities.length == 0
      cities = cities.concat @state.previousSuggestCities

    return {
      isValidSearch: input.trim().length > 0
      isLastCharSpace: isLastCharSpace
      isNumbersInQuery: isNumbersInQuery 
      isAddressSearch: isNumbersInQuery or isLastCharSpace
      query: input
      queryCities: cities
      queryAddress: address 
      queryNumber: input.match(/\d+/)
    }

  findLocation: (cities, address, number) =>
    # We need to have city information available when finding location
    if not cities or cities.length == 0
      console.log("Cannot find location without city information")
      return

    # Construct urls for all cities depending whether we have a number present or not
    urls = cities.map (city) ->
      queryPath = if number then "address/#{city}/#{address}/#{number}" else "street/#{city}/#{address}"
      "http://matka.hsl.fi/geocoder/" + queryPath
    
    # Query all constructed urls for address and hope to find hits from one city
    XhrPromise.getJsons(urls).then (cityResults) => 
      foundLocations = []
      for data in cityResults
        if data.results.length > 0
          # We store first hit. this means search without address is same as "address 1"
          foundLocations.push(data.results[0])

      if foundLocations.length == 1
        # TODO, handle Swedish names too at some point
        addressString = if number then "#{address} #{number}, #{foundLocations[0].municipalityFi}" else "#{address}, #{foundLocations[0].municipalityFi}"
        @setLocation(foundLocations[0].location[1], foundLocations[0].location[0], addressString)
      else if foundLocations.length > 1
        console.log("Query #{address}, #{number}, #{cities} returns results from more than 1 city. Cannot set location.")        
      else
        console.log("Cannot find any locations with #{address}, #{number}, #{cities}")

  setLocation: (lat, lon, address) =>
    # We first check if we already have a location. 
    if @state.hasLocation
      # Yes, location to be set is destination address
      @context.router.transitionTo "itineraryList", 
        from: "#{@state.address}::#{@state.lat},#{@state.lon}"
        to: "#{address}::#{lat},#{lon}"
    else 
      # No, This is a start location
      @context.executeAction LocateActions.manuallySetPosition, {
        'lat': lat
        'lon': lon
        'address': address
      }

  getSuggestions: (input, callback) =>
    analyzed = @analyzeInput(input)
    if analyzed.isAddressSearch
      @searchAddresses(analyzed.queryCities, analyzed.queryAddress, analyzed.queryNumber, callback)
    else 
      @searchSuggests(analyzed.queryAddress, callback)
    
  searchAddresses: (cities, address, number, callback) ->
    numberRegex = if number then new RegExp("^" + number) else /.*/
    urls = cities.map (city) ->
      "http://matka.hsl.fi/geocoder/street/#{city}/#{address}"

    XhrPromise.getJsons(urls).then (cityResults) ->
      addresses = []  
      for data in cityResults
        for address in data.results
          if numberRegex.test(parseInt(address.osoitenumero))
            staircaseSelection = if address.unit? then address.unit else ""
            addresses.push
              'type': 'address'
              'address': address.streetFi  # TODO Swedish names here too
              'lat': address.location[1]
              'lon': address.location[0]
              'number': address.number
              'staircase': address.unit
              'city': address.municipalityFi  # TODO Swedish names here too
              'selection': "#{address.streetFi} #{address.number}#{staircaseSelection}, #{address.municipalityFi}"
      callback(null, addresses)

  searchSuggests: (address, callback) => 
    XhrPromise.getJson("http://matka.hsl.fi/geocoder/suggest/#{address}").then (data) =>
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
            if city.key.toLowerCase() not in uniqueCities and streetName.toLowerCase() == address.toLowerCase()
              uniqueCities.push(city.key.toLowerCase())

      @setState
        previousSuggestCities: uniqueCities

      stops = data.stops.map (result) -> 
        'type': 'stop'
        'address': result.nameFi
        'lat': result.location[1] 
        'lon': result.location[0]
        'stopCode': result.stopCode
        'selection': "#{result.nameFi} (#{result.stopCode})"
      
      if streets.length == 1 and stops.length == 0
        # We can directly do address search
        @searchAddresses([streets[0].city], streets[0].address, null, callback)
        callback(null, all)
      else 
        # We just show results
        all = streets.concat stops   
        callback(null, all) 

  renderSuggestion: (suggestion, input) ->
    value = suggestion.selection
    reqex = new RegExp('\\b' + value, 'i')
    firstMatchIndex = value.toLowerCase().indexOf(input.toLowerCase())
    lastMatchIndex = firstMatchIndex + input.length
    
    switch suggestion.type
      when 'street' then icon = """<svg viewBox="0 0 40 40" class="icon"><use xlink:href="#icon-icon_place"></use></svg>"""
      when 'address' then icon = """<svg viewBox="0 0 40 40" class="icon"><use xlink:href="#icon-icon_place"></use></svg>"""
      when 'stop' then icon = """<svg viewBox="0 0 40 40" class="icon"><use xlink:href="#icon-icon_direction-b"></use></svg>"""
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
  
  suggestionValue: (suggestion) ->
    return suggestion.selection

  suggestionSelected: (suggestion, e) =>
    # Prevent default so that form submit will not happen in this case
    e.preventDefault()
    if suggestion.lat != undefined and suggestion.lon != undefined
      @setLocation(suggestion.lat, suggestion.lon, suggestion.selection)
    else 
      analyzed = @analyzeInput(suggestion.selection)
      @findLocation(analyzed.queryCities, analyzed.queryAddress, analyzed.queryNumber)

  # This will get autoSuggestComponent when it mounts
  # See: https://github.com/moroshko/react-autosuggest/issues/21
  handleAutoSuggestMount: (autoSuggestComponent) =>
    if autoSuggestComponent
      input = autoSuggestComponent.refs.input.getDOMNode()
      input.addEventListener('keydown', @suggestionArrowPress)
      this.autoSuggestInput = input

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
    analyzed = @analyzeInput(this.autoSuggestInput.value)
    @findLocation(analyzed.queryCities, analyzed.queryAddress, analyzed.queryNumber)

  # We use two different components depending on location state
  # this way we can prevent autosuggest from keeping selected value as state
  render: =>
    inputDisabled = ""
    if @state.isLocationingInProgress
      inputDisabled = 'disabled'
      placeholder = 'Odota, sijaintiasi etsitään'
    else if @state.hasLocation
      placeholder = 'Määränpään osoite, linja tai pysäkki' 
    else 
      placeholder = 'Lähtöosoite, linja tai pysäkki'

    inputAttributes =
      id: AUTOSUGGEST_ID
      placeholder: placeholder
      disabled: inputDisabled

    <form onSubmit={@onSubmit}>
      <Autosuggest 
        ref={@handleAutoSuggestMount}
        key={if @state.hasLocation then 'to' else 'from'}
        inputAttributes={inputAttributes}
        suggestions={@getSuggestions}
        suggestionRenderer={@renderSuggestion}
        suggestionValue={@suggestionValue}
        onSuggestionSelected={@suggestionSelected}
        showWhen={(input) => input.trim().length >= 2}/>    
    </form>

module.exports = Search
