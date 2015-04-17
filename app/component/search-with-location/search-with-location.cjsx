React          = require 'react'
$              = require 'jquery'
if window?
  Typeahead      = require 'typeaheadjs-shim'
  Bloodhound     = require 'bloodhound-shim'
LocateActions  = require '../../action/locate-actions.coffee'
LocationStore  = require '../../store/location-store.coffee'
Icon           = require '../icon/icon.cjsx'
ReactPropTypes = React.PropTypes;

GEOCODING_SUGGEST_URL = 'http://matka.hsl.fi/geocoder/suggest/'

class SearchWithLocation extends React.Component
  constructor: -> 
    super
    @state = LocationStore.getLocationState() 
  
  componentDidMount: -> 
    LocationStore.addChangeListener @onChange

    if window?
      # Create geocoding datasource
      geoData = new Bloodhound
        limit: 50
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value')
        queryTokenizer: Bloodhound.tokenizers.whitespace
        remote: 
          url: GEOCODING_SUGGEST_URL + '%QUERY'
          rateLimitBy: 'debounce'
          rateLimitWait: 100
          filter: (data) -> 
            streets = data.streetnames.map (result) -> 
              'value': result.key, 
              'type': 'address'              
            stops = data.stops.map (result) -> 
              'value': result.stop_name, 
              'type': 'stop', 
              'lat': result.location[1], 
              'lon': result.location[0]
            all = streets.concat stops
            return all

      geoData.initialize()

      # create typeahead
      $(@refs.typeahead.getDOMNode()).typeahead {
        hint: false
        highlight: true
        minLength: 2
      }, {
        name: 'geodata'
        displayKey: 'value'
        source: geoData.ttAdapter()
        templates:
            suggestion: (result) ->
              switch result.type
                when 'address' then return """<p class='address'><svg viewBox="0 0 40 40" class="icon"><use xlink:href="#icon-icon_place"></use></svg>#{result.value}</p>"""
                when 'stop' then return """<p class='stop'><svg viewBox="0 0 40 40" class="icon"><use xlink:href="#icon-icon_bus-withoutBox"></use></svg>#{result.value}</p>"""
                else return "<p>#{result.value}</p>"
      }

      $(@refs.typeahead.getDOMNode()).bind 'typeahead:selected', (e, suggestion, dataset) =>
        @manuallySetPositionIfNecessary(suggestion.lat, suggestion.lon)

      # Move window when search gets focus
      $(@refs.typeahead.getDOMNode()).focus () -> 
        location = $(this).offset().top - 45
        $('hmtl, body').scrollTop(location)

  componentWillUnmount: ->
    LocationStore.removeChangeListener @onChange
    $(@refs.typeahead.getDOMNode()).typeahead('destroy')

  onChange: =>
    @setState LocationStore.getLocationState()

  locateUser: ->
    LocateActions.findLocation()

  removeLocation: (e) ->
    LocateActions.removeLocation()

  manuallySetPositionIfNecessary: (lat, lon) ->
    if this.state.status != LocationStore.STATUS_FOUND_LOCATION and lat != undefined and lon != undefined
      LocateActions.manuallySetPosition(lat, lon)

  render: ->
    arrow = null
    switch this.state.status
        when LocationStore.STATUS_NO_LOCATION
          location = <span className="inline-block cursor-pointer" onClick={this.locateUser}><span className="dashed">Paikanna</span> tai kirjoita lähtöpaikkasi</span>
          arrow = <div className="arrow-down"></div>
        when LocationStore.STATUS_SEARCHING_LOCATION
          location = <span className="inline-block cursor-pointer" onClick={this.locateUser}>Paikannetaan...</span>
        when LocationStore.STATUS_FOUND_LOCATION
          location = <span className="inline-block cursor-pointer" onClick={this.locateUser}>{this.state.address}</span>
        when LocationStore.STATUS_FOUND_ADDRESS
          console.log("ADDRESS")
          location = <span className="inline-block cursor-pointer" onClick={this.locateUser}>{this.state.address}</span>
        when LocationStore.STATUS_GEOLOCATION_DENIED
          location = <span className="inline-block cursor-pointer" onClick={this.locateUser}>Et ole sallinut paikannusta</span>
        when LocationStore.STATUS_GEOLOCATION_NOT_SUPPORTED
          location = <span className="inline-block cursor-pointer" onClick={this.locateUser}>Paikannus ei ole tuettuna</span>


    <form className="search-form">
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
                <span className="inline-block right cursor-pointer" onClick={this.removeLocation}>
                  <Icon img={'icon-icon_close'}/>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="small-12 medium-6 medium-offset-3 columns">
          <div className="row collapse postfix-radius">
            <div className="small-11 columns">
              <input type="text" ref="typeahead" placeholder="Määränpään osoite, linja, pysäkki tai aika" />
            </div>
            <div className="small-1 columns">
              <span className="postfix search">
                <Icon img={'icon-icon_search'}/>

              </span>
            </div>
          </div>
        </div>
      </div>
    </form>

module.exports = SearchWithLocation