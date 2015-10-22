React = require 'react'
EndpointActions  = require '../../action/endpoint-actions.coffee'
LocateActions  = require '../../action/locate-actions.coffee'
Autosuggest = require './autosuggest'
Link = require 'react-router/lib/Link'
{locationToOTP} = require '../../util/otp-strings'
GeolocationBar = require './geolocation-bar'
SearchTwoFields = require './search-two-fields'

intl = require 'react-intl'
FormattedMessage = intl.FormattedMessage

class SearchTwoFieldsContainer extends React.Component
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

  onEndpointChange: =>
    @forceUpdate()
    @routeIfPossible() #TODO: this should not be done here

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

      # TODO: currently address gets overwritten by reverse from geolocation
      # Swap the position of the two arguments to get "Oma sijainti"
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

  getGeolocationBar: (geolocation) =>
    <GeolocationBar
      geolocation={geolocation}
      removePosition={() => @context.executeAction EndpointActions.clearGeolocation}
      locateUser={() => @context.executeAction LocateActions.findLocation}
    />

  render: =>
    geolocation = @context.getStore('LocationStore').getLocationState()
    origin = @context.getStore('EndpointStore').getOrigin()
    destination = @context.getStore('EndpointStore').getDestination()

    from =
      if origin.useCurrentPosition
        @getGeolocationBar(geolocation)
      else
        <Autosuggest
          key="origin"
          onSelectionAction={EndpointActions.setOrigin}
          placeholder={@context.intl.formatMessage(
            id: 'origin'
            defaultMessage: "From where? - address or stop")}
          value=origin.address
          id="origin"
        />

    to =
      if origin.useCurrentPosition and geolocation.isLocationingInProgress
        <input
          key="destination"
          type="text"
          placeholder={@context.intl.formatMessage(
            id: 'destination'
            defaultMessage: "Where to? - address or stop")}
          disabled="disabled"
        />
      else if destination.useCurrentPosition
        @getGeolocationBar(geolocation)
      else
        <Autosuggest
          key="destination"
          onSelectionAction={EndpointActions.setDestination}
          placeholder={@context.intl.formatMessage(
            id: 'destination'
            defaultMessage: "Where to? - address or stop")}
          value=destination.address
          id="destination"
        />

    <SearchTwoFields from={from} to={to} onSwitch={@onSwitch} routeIfPossible={@routeIfPossible}/>

module.exports = SearchTwoFieldsContainer
