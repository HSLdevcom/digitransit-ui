React          = require 'react'
$              = require 'jquery'
if window?
  window.jQuery  = require "jquery"
  Bloodhound     = require 'typeahead.js'
LocateActions  = require '../../action/locate-actions.coffee'
Icon           = require '../icon/icon.cjsx'

GEOCODING_SUGGEST_URL = 'http://matka.hsl.fi/geocoder/'

class SearchWithLocation extends React.Component

  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  constructor: -> 
    super
    @state = @context.getStore('LocationStore').getLocationState() 
  
  componentDidMount: -> 
    @context.getStore('LocationStore').addChangeListener @onChange
    if window?
      # Create geocoding datasource
      filterAddressesByNumber = @filterAddressesByNumber
      filterSuggest = @filterSuggest
      resolveGeocodingUrl = @resolveGeocodingUrl

      geoData = new Bloodhound
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('address')
        queryTokenizer: Bloodhound.tokenizers.whitespace
        remote: 
          prepare: (query, settings) ->
            settings.url = settings.url + resolveGeocodingUrl(query)
            return settings

          url: GEOCODING_SUGGEST_URL
          rateLimitBy: 'debounce'
          rateLimitWait: 100
          filter: (data) -> 
            if data.results
              filterAddressesByNumber(data)
            else 
              filterSuggest(data)

      geoData.initialize()

      # create typeahead
      $(@refs.typeahead.getDOMNode()).typeahead {
        hint: false
        highlight: true
        minLength: 2
      }, {
        name: 'geodata'
        limit: 50
        displayKey: 'selection'
        source: geoData.ttAdapter()
        templates:
            suggestion: (result) ->
              switch result.type
                when 'stop' then return """<p class='stop'><svg viewBox="0 0 40 40" class="icon"><use xlink:href="#icon-icon_direction-b"></use></svg>#{result.address} <span class="city">(#{result.stopCode})</span></p>"""
                when 'street' then """<p class='address'><svg viewBox="0 0 40 40" class="icon"><use xlink:href="#icon-icon_place"></use></svg>#{result.address}, #{result.city}</p>"""
                when 'address' then """<p class='address'><svg viewBox="0 0 40 40" class="icon"><use xlink:href="#icon-icon_place"></use></svg>#{result.address} #{result.number}, #{result.city}</p>"""
                else "#{result.address}</p>"
      }

      $(@refs.typeahead.getDOMNode()).bind 'typeahead:select', (e, suggestion, dataset) =>
        @manuallySetPositionIfNecessary(suggestion)

  resolveGeocodingUrl: (query) ->
    lastCharIsSpace = /\s+$/.test(query)
    numberInQuery = query.match(/\d/)
    city = "helsinki"
    queryWithoutNumbers = query.replace(/\d+/g,'')

    if lastCharIsSpace or numberInQuery
      return "search/#{city}/#{queryWithoutNumbers}" 
    else 
      return "suggest/#{queryWithoutNumbers}"
    
  filterSuggest: (data) ->
    streets = []
    for streetName, cities of data.streetnames
      for city in cities
        streets.push
          'type': 'street'    
          'address': "#{streetName}"
          'city': "#{city.key}"
          'selection': "#{streetName}"

    stops = data.stops.map (result) -> 
      'type': 'stop'
      'address': result.stop_name
      'lat': result.location[1] 
      'lon': result.location[0]
      'stopCode': result.stop_code
      'selection': "#{result.stop_name} (#{result.stop_code})"

    all = streets.concat stops 
    return all

  filterAddressesByNumber: (data) ->
    addresses = []  
    for address in data.results
      addresses.push
        'type': 'address' 
        'address': address.katunimi
        'lat': address.location[1] 
        'lon': address.location[0]
        'number': address.osoitenumero
        'city': address.kaupunki
        'selection': "#{address.katunimi} #{address.osoitenumero}"
    return addresses

  componentWillUnmount: ->
    @context.getStore('LocationStore').removeChangeListener @onChange
    $(@refs.typeahead.getDOMNode()).typeahead('destroy')

  onChange: =>
    @setState @context.getStore('LocationStore').getLocationState()

  locateUser: ->
    @context.executeAction LocateActions.findLocation

  removeLocation: (e) ->
    @context.executeAction LocateActions.removeLocation

  manuallySetPositionIfNecessary: (suggestion) ->
    type = suggestion.type
    lat = suggestion.lat 
    lon = suggestion.lon
    if suggestion.type == "stop" then value = "#{suggestion.address} (#{suggestion.stopCode})"
    if suggestion.type == "street" then value = "#{suggestion.address}, #{suggestion.city}"
    if suggestion.type == "address" then value = "#{suggestion.address} #{suggestion.number}, #{suggestion.city}"
      
    # Set location if available and not set already
    FOUND_ADDRESS = @context.getStore('LocationStore').STATUS_FOUND_ADDRESS
    if this.state.status != FOUND_ADDRESS and lat != undefined and lon != undefined
      console.log(1)
      @context.executeAction LocateActions.manuallySetPosition, {
        'lat': lat
        'lon': lon
        'address': value
      }

      # This has to be done in next event loop
      setTimeout () =>
        $(@refs.typeahead.getDOMNode()).val('')
      , 1
    # If no location is available, fetch first hit
    else if this.state.status != FOUND_ADDRESS and lat == undefined && lon == undefined
      $.getJSON "http://matka.hsl.fi/geocoder/search/#{suggestion.city}/#{suggestion.address}", (data) =>
        if data.results.length == 0
          # TODO, What now?
          @context.executeAction LocateActions.manuallySetPosition, {
            'lat': 60.21230809242619
            'lon': 24.949568995764682
            'address': "No first address number, what now!?"
          }
        else 
          @context.executeAction LocateActions.manuallySetPosition, {
            'lat': data.results[0].location[1]
            'lon': data.results[0].location[0]
            'address': value
          }
      # This has to be done in next event loop
      setTimeout () =>
        $(@refs.typeahead.getDOMNode()).val('')
      , 1

  render: ->
    arrow = null
    searchPlaceholder = null
    clearLocation = null
    LocationStore = @context.getStore 'LocationStore'

    switch this.state.status
        when LocationStore.STATUS_NO_LOCATION
          location = <span className="inline-block cursor-pointer" onClick={this.locateUser}><span className="dashed">Paikanna</span> tai kirjoita lähtöpaikkasi</span>
          arrow = <div className="arrow-down"></div>
          searchPlaceholder = "Lähtöosoite, linja tai pysäkki"
        when LocationStore.STATUS_SEARCHING_LOCATION
          location = <span className="inline-block cursor-pointer">Paikannetaan...</span>
          searchPlaceholder = ""
        when LocationStore.STATUS_FOUND_LOCATION
          location = <span className="inline-block cursor-pointer address" onClick={this.locateUser}>{this.state.address}</span>
          searchPlaceholder = ""
        when LocationStore.STATUS_FOUND_ADDRESS
          location = <span className="inline-block cursor-pointer address" onClick={this.locateUser}>{this.state.address}</span>
          clearLocation = <span className="inline-block right cursor-pointer" onClick={this.removeLocation}><Icon img={'icon-icon_close'}/></span>
          searchPlaceholder = "Määränpään osoite, linja, tai pysäkki"
        when LocationStore.STATUS_GEOLOCATION_DENIED
          location = <span className="inline-block cursor-pointer" onClick={this.locateUser}>Lähtöosoite, linja tai pysäkki</span>
        when LocationStore.STATUS_GEOLOCATION_NOT_SUPPORTED
          location = <span className="inline-block cursor-pointer" onClick={this.locateUser}>Kirjoita lähtöpaikkasi</span>
        when LocationStore.STATUS_GEOLOCATION_TIMEOUT
          location = <span className="inline-block cursor-pointer" onClick={this.locateUser}>Paikannus ei onnistunut. <span className="dashed">Yritä uudelleen</span> tai kirjoita lähtöpiste</span>

    <div className="search-form">
      <div className="row">
        <div className="small-12 medium-6 medium-offset-3 columns">
          <div className="row">
            <div className="small-12 columns">
              <div className="transparent location"> 
                <span className="inline-block" onClick={this.locateUser}>
                  <Icon img={'icon-icon_mapMarker-location'}/>
                </span>
                {location}
                {arrow}
                {clearLocation}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="small-12 medium-6 medium-offset-3 columns">
          <div className="row collapse postfix-radius">
            <div className="small-11 columns">
              <input id="moi"type="text" ref="typeahead" placeholder={searchPlaceholder} />
            </div>
            <div className="small-1 columns">
              <span className="postfix search">
                <Icon img={'icon-icon_search'}/>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

module.exports = SearchWithLocation