React = require 'react'
Icon = require '../icon/icon'
EndpointActions  = require '../../action/endpoint-actions.coffee'
Autosuggest = require './autosuggest'
Link = require 'react-router/lib/Link'
config = require '../../config'
{locationToOTP} = require '../../util/otp-strings'

intl = require('react-intl')
FormattedMessage = intl.FormattedMessage

locationValue = (location) ->
  decodeURIComponent(location.split("::")[0])

class SearchTwoFields extends React.Component
  @contextTypes:
    executeAction: React.PropTypes.func.isRequired
    getStore: React.PropTypes.func.isRequired
    history: React.PropTypes.object.isRequired
    intl: intl.intlShape.isRequired

  constructor: (props) ->
    super

  componentWillMount: =>
    @context.getStore('EndpointStore').addChangeListener @onEndpointChange
    @setState
      origin: @context.getStore('EndpointStore').getOrigin()
      destination: @context.getStore('EndpointStore').getDestination()
    @onGeolocationChange()

  componentDidMount: =>
    @context.getStore('LocationStore').addChangeListener @onGeolocationChange

  componentWillUnmount: =>
    @context.getStore('EndpointStore').removeChangeListener @onEndpointChange
    @context.getStore('LocationStore').removeChangeListener @onGeolocationChange

  onGeolocationChange: =>
    geo = @context.getStore('LocationStore').getLocationState()
    @setState
      geo: geo
    if not (geo.status == 'no-location' or
            geo.isLocationingInProgress or
            geo.hasLocation)
      @removePosition()

  removePosition: =>
    if @state.origin.useCurrentPosition
      @context.executeAction EndpointActions.clearOrigin
    if @state.destination.useCurrentPosition
      @context.executeAction EndpointActions.clearDestination

  onEndpointChange: =>
    origin = @context.getStore('EndpointStore').getOrigin()
    destination = @context.getStore('EndpointStore').getDestination()
    @setState
      origin: origin
      destination: destination
    @routeIfPossible()

  selectOrigin: (lat, lon, address) =>
    @context.executeAction EndpointActions.setOrigin, {
      'lat': lat
      'lon': lon
      'address': address
    }

  selectDestination: (lat, lon, address) =>
    @context.executeAction EndpointActions.setDestination, {
      'lat': lat
      'lon': lon
      'address': address
    }

  onSwitch: (e) =>
    e.preventDefault()

    origin = @state.origin
    destination = @state.destination

    # Button is disabled when geolocationing is in process
    if origin.useCurrentPosition and @state.geo.isLocationingInProgress
      return

    # Avoid accidentally having both set at the same time
    # (causing a itinerary search) when actually only one is
    @context.executeAction EndpointActions.clearOrigin
    @context.executeAction EndpointActions.clearDestination

    if origin.useCurrentPosition
      @context.executeAction EndpointActions.setDestinationToCurrent
    else
      @context.executeAction EndpointActions.setDestination, {
        'lat': origin.lat
        'lon': origin.lon
        'address': origin.address
      }

    if destination.useCurrentPosition
      @context.executeAction EndpointActions.setOriginToCurrent
    else
      @context.executeAction EndpointActions.setOrigin, {
        'lat': destination.lat
        'lon': destination.lon
        'address': destination.address
      }

  routeIfPossible: =>
    if ((@state.origin.lat or @state.origin.useCurrentPosition and
                              @state.geo.hasLocation) and
        (@state.destination.lat or @state.destination.useCurrentPosition and
                                   @state.geo.hasLocation))
      # First, we must blur input field because without this
      # Android keeps virtual keyboard open too long which
      # causes problems in next page rendering
      #@autoSuggestInput.blur()

      geo_string = locationToOTP(
        Object.assign({address: "Oma sijainti"}, @state.geo))

      if @state.origin.useCurrentPosition
        from = geo_string
      else
        from = locationToOTP(@state.origin)

      if @state.destination.useCurrentPosition
        to = geo_string
      else
        to = locationToOTP(@state.destination)

      # Then we can transition. We must do this in next
      # event loop in order to get blur finished.
      setTimeout(() =>
        @context.history.pushState(null, "#{process.env.ROOT_PATH}reitti/#{from}/#{to}")
      , 0)

  render: =>
    # We don't have state on the server, because we don't have a geolocation,
    # so just render the input field
    if @state.geo
      geolocation_div =
          <div className="input-placeholder">
            <div className="address-box">
            <span className="inline-block" onClick={@locateUser}>
                <Icon img={'icon-icon_mapMarker-location'}/>
            </span>
            {if @state.geo.isLocationingInProgress
              <FormattedMessage id="searching-position"
                                defaultMessage='Searching for your position...' />
             else if @state.geo.hasLocation
              <FormattedMessage id="own-position"
                                defaultMessage='My current position' />
             else
              <FormattedMessage id="no-position"
                                defaultMessage='No position' />
            }
            <span className="inline-block right cursor-pointer"
                  onClick={@removePosition}>
              <Icon img={'icon-icon_close'} /></span>
            </div>
          </div>

    <div className="search-form">
      <div className="row">
        <div className="small-12 medium-6 medium-offset-3 columns
                        search-form-map-overlay">
          <div className="row collapse postfix-radius">
            <div className="small-11 columns">
              {if @state.origin.useCurrentPosition
                geolocation_div
               else
                <form onSubmit={@onSubmit}>
                  <Autosuggest onSelection={@selectOrigin}
                               placeholder={@context.intl.formatMessage(
                                 {id: 'origin', defaultMessage: "From where? - address or stop"})}
                               value=@state.origin.address
                               />
                </form>
              }
            </div>
            <div className="small-1 columns">
              <span className="postfix search cursor-pointer" onClick={@onSwitch}>
                <Icon img={'icon-icon_direction-a'}/>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="small-12 medium-6 medium-offset-3 columns search-form-map-overlay">
          <div className="row collapse postfix-radius">
            <div className="small-11 columns">
              {if @state.origin.useCurrentPosition and
                  @state.geo.isLocationingInProgress
                <input type="text"
                       placeholder={@context.intl.formatMessage(
                         {id: 'destination', defaultMessage: "Where to? - address or stop"})}
                       disabled="disabled"
                       />
               else if @state.destination.useCurrentPosition
                geolocation_div
               else
                <form onSubmit={@onSubmit}>
                  <Autosuggest onSelection={@selectDestination}
                               placeholder={@context.intl.formatMessage(
                                 {id: 'destination', defaultMessage: "Where to? - address or stop"})}
                               value=@state.destination.address
                               />
                </form>
              }
            </div>
            <div className="small-1 columns">
              <span className="postfix search cursor-pointer"
                    onClick={@routeIfPossible}>
                <Icon img={'icon-icon_search'}/>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

module.exports = SearchTwoFields
