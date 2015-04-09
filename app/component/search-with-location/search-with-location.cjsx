React          = require 'react'
$              = require 'jquery'
Typeahead      = require 'typeaheadjs-shim'
Bloodhound     = require 'bloodhound-shim'
LocateActions  = require '../../action/locate-actions.coffee'
LocationStore  = require '../../store/location-store.coffee'
ReactPropTypes = React.PropTypes;

GEOCODING_SUGGEST_URL = 'http://matka.hsl.fi/geocoder/suggest/'

class SearchWithLocation extends React.Component
  constructor: -> 
    super
    @state = LocationStore.getLocationState() 
  
  componentDidMount: -> 
    LocationStore.addChangeListener @onChange

    # Create geocoding datasource
    geoData = new Bloodhound
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value')
      queryTokenizer: Bloodhound.tokenizers.whitespace
      remote: 
        url: GEOCODING_SUGGEST_URL + '%QUERY'
        rateLimitBy: 'debounce'
        rateLimitWait: 100
        filter: (data) -> 
          data.responses[0].aggregations.streets.buckets.map (result) -> {'value': result.key, 'type': 'address'}

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
              when 'address' then return "<p class='address'><i class='icon icon-pin'>#{result.value}</i></p>"
              when 'poi' then return "<p class='poi'>#{result.value} (poi)</p>"
              else return "<p>#{result.value}</p>"
    }

    # Move window when search gets focus
    $(@refs.typeahead.getDOMNode()).focus () -> 
      location = $(this).offset().top - 45
      $('hmtl, body').scrollTop(location)

  componentWillUnmount: ->
    LocationStore.removeChangeListener @onChange
    $(@refs.typeahead.getDOMNode()).typeahead('destroy')

  onChange: =>
    @setState LocationStore.getLocationState()

  render: ->
    location = this.state.lat + ", " + this.state.lon
    <form className="search-form">
      <div className="row">
        <div className="small-12 medium-6 medium-offset-3 columns">
          <div className="row collapse prefix-and-postfix-radius">
            <div className="small-1 columns">
              <span className="prefix transparent" onClick={this.locateUser}>
                <i className="icon icon-location"></i>
              </span>
            </div>
            <div className="small-10 columns">
              <input type="text" placeholder={location} className="transparent"/>
            </div>
            <div className="small-1 columns">
              <span className="postfix transparent" onClick={this.removeLocation}>
                X
              </span>
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
              <span className="postfix search"><i className="icon icon-search"></i></span>
            </div>
          </div>
        </div>
      </div>
    </form>

  locateUser: ->
    LocateActions.findLocation()

  removeLocation: ->
    LocateActions.removeLocation()

module.exports = SearchWithLocation