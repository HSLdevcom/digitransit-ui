React = require 'react'
Icon = require '../icon/icon'
EndpointActions  = require '../../action/endpoint-actions.coffee'
Autosuggest = require './autosuggest'
Link = require 'react-router/lib/Link'
config = require '../../config'
{locationToOTP} = require '../../util/otp-strings'
GeolocationBar = require './geolocation-bar'

intl = require 'react-intl'
FormattedMessage = intl.FormattedMessage

locationValue = (location) ->
  decodeURIComponent(location.split("::")[0])

class SearchTwoFields extends React.Component
  @contextTypes:
    executeAction: React.PropTypes.func.isRequired
    getStore: React.PropTypes.func.isRequired
    history: React.PropTypes.object.isRequired
    intl: intl.intlShape.isRequired

  componentWillMount: =>
    @context.getStore('EndpointStore').addChangeListener @onEndpointChange
    @context.getStore('LocationStore').addChangeListener @onGeolocationChange

  componentWillUnmount: =>
    @context.getStore('EndpointStore').removeChangeListener @onEndpointChange
    @context.getStore('LocationStore').removeChangeListener @onGeolocationChange

  onGeolocationChange: =>
    @forceUpdate()

  removePosition: =>
    if @context.getStore('EndpointStore').getOrigin().useCurrentPosition
      @context.executeAction EndpointActions.clearOrigin
    if @context.getStore('EndpointStore').getDestination().useCurrentPosition
      @context.executeAction EndpointActions.clearDestination

  onEndpointChange: =>
    @forceUpdate()
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

    origin = @context.getStore('EndpointStore').getOrigin()
    geolocation = @context.getStore('LocationStore').getLocationState()

    # Button is disabled when geolocationing is in process
    if origin.useCurrentPosition and geolocation.isLocationingInProgress
      return

    @context.executeAction EndpointActions.swapOriginDestination

  routeIfPossible: =>
    geolocation = @context.getStore('LocationStore').getLocationState()
    origin = @context.getStore('EndpointStore').getOrigin()
    destination = @context.getStore('EndpointStore').getDestination()

    if ((origin.lat or origin.useCurrentPosition and geolocation.hasLocation) and
        (destination.lat or destination.useCurrentPosition and geolocation.hasLocation))
      # First, we must blur input field because without this
      # Android keeps virtual keyboard open too long which
      # causes problems in next page rendering
      #@autoSuggestInput.blur()

      geo_string = locationToOTP(
        Object.assign({address: "Oma sijainti"}, geolocation))

      if origin.useCurrentPosition
        from = geo_string
      else
        from = locationToOTP(origin)

      if destination.useCurrentPosition
        to = geo_string
      else
        to = locationToOTP(destination)

      # Then we can transition. We must do this in next
      # event loop in order to get blur finished.
      setTimeout(() =>
        @context.history.pushState(null, "#{process.env.ROOT_PATH}reitti/#{from}/#{to}")
      , 0)

  render: =>
    geolocation = @context.getStore('LocationStore').getLocationState()
    origin = @context.getStore('EndpointStore').getOrigin()
    destination = @context.getStore('EndpointStore').getDestination()

    <div className="search-form">
      <div className="row">
        <div className="small-12 medium-6 medium-offset-3 columns
                        search-form-map-overlay">
          <div className="row collapse postfix-radius">
            <div className="small-11 columns">
              {if origin.useCurrentPosition
                <GeolocationBar
                  geolocation={geolocation}
                  removePosition={@removePosition}
                  locateUser={() => @context.executeAction LocateActions.findLocation}
                />
               else
                 <Autosuggest onSelection={@selectOrigin}
                              placeholder={@context.intl.formatMessage(
                                id: 'origin'
                                defaultMessage: "From where? - address or stop")}
                              value=origin.address
                              id="origin"
                              />
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
              {if origin.useCurrentPosition and geolocation.isLocationingInProgress
                <input type="text"
                       placeholder={@context.intl.formatMessage(
                         id: 'destination'
                         defaultMessage: "Where to? - address or stop")}
                       disabled="disabled"/>
               else if destination.useCurrentPosition
                 <GeolocationBar
                   geolocation={geolocation}
                   removePosition={@removePosition}
                   locateUser={() => @context.executeAction LocateActions.findLocation}
                 />
               else
                 <Autosuggest onSelection={@selectDestination}
                              placeholder={@context.intl.formatMessage(
                                id: 'destination'
                                defaultMessage: "Where to? - address or stop")}
                              value=destination.address
                              id="destination"
                              />
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
