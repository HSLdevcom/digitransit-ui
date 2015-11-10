React = require 'react'
EndpointActions  = require '../../action/endpoint-actions.coffee'
PositionActions  = require '../../action/position-actions.coffee'
Autosuggest = require './autosuggest'
Link = require 'react-router/lib/Link'
{locationToOTP} = require '../../util/otp-strings'
GeolocationBar = require './geolocation-bar'
SearchTwoFields = require './search-two-fields'
NavigateOrInput = require './navigate-or-input'

intl = require 'react-intl'
FormattedMessage = intl.FormattedMessage

class SearchTwoFieldsContainer extends React.Component

  constructor: ->
    super

    origin = @context.getStore('EndpointStore').getOrigin()
    dest = @context.getStore('EndpointStore').getDestination()

    @state =
      if origin.useCurrentPosition
        origin:
          userInput: false
      else
        origin:
          userInput: true

    if dest.useCurrentPosition
      @state.dest =
        userInput: false
    else
      @state.dest =
        userInput: true

  @contextTypes:
    executeAction: React.PropTypes.func.isRequired
    getStore: React.PropTypes.func.isRequired
    history: React.PropTypes.object.isRequired
    intl: intl.intlShape.isRequired

  componentWillMount: =>
    @context.getStore('EndpointStore').addChangeListener @onEndpointChange
    @context.getStore('PositionStore').addChangeListener @onGeolocationChange

  componentWillUnmount: =>
    @context.getStore('EndpointStore').removeChangeListener @onEndpointChange
    @context.getStore('PositionStore').removeChangeListener @onGeolocationChange

  onGeolocationChange: (statusChanged) =>
    #We want to rerender only if position status changes,
    #not if position changes
    if statusChanged
      @forceUpdate()

  onEndpointChange: (clearGeolocation) =>
    if clearGeolocation in ['origin']
      @setState
        origin:
          userInput: true
    else if clearGeolocation in ['dest']
      @setState
        dest:
          userInput: true
    else
      @forceUpdate()

    @routeIfPossible() #TODO: this should not be done here

  onSwitch: (e) =>
    e.preventDefault()

    origin = @context.getStore('EndpointStore').getOrigin()
    geolocation = @context.getStore('PositionStore').getLocationState()

    # Button is disabled when geolocationing is in process
    if origin.useCurrentPosition and geolocation.isLocationingInProgress
      return

    @context.executeAction EndpointActions.swapOriginDestination

  removePosition: =>
    @context.executeAction EndpointActions.clearGeolocation

  setOriginToCurrent: =>
    @context.executeAction EndpointActions.setOriginToCurrent

  setDestinationToCurrent: =>
    @context.executeAction EndpointActions.setDestinationToCurrent

  enableInputMode: (endpoint) =>
    if endpoint in ['origin', 'dest']
      if endpoint == 'origin'
        @setState
          origin:
            userInput: true
      else
        @setState
          dest:
            userInput: true

  disableInputMode: (endpoint) =>
    if endpoint in ['origin', 'dest']
      @setState if endpoint == "origin"
        origin:
          userInput: false
      else
        dest:
          userInput: false

  routeIfPossible: =>
    geolocation = @context.getStore('PositionStore').getLocationState()
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
        @context.history.pushState(null, "/reitti/#{from}/#{to}")
      , 0)

  getGeolocationBar: (geolocation) =>
    <GeolocationBar
      geolocation={geolocation}
      removePosition={@removePosition}
      locateUser={() => @context.executeAction PositionActions.findLocation}
    />

  render: =>
    geolocation = @context.getStore('PositionStore').getLocationState()
    origin = @context.getStore('EndpointStore').getOrigin()
    destination = @context.getStore('EndpointStore').getDestination()

    from =
      if origin.useCurrentPosition
        @getGeolocationBar(geolocation)
      else if @state.origin.userInput
        <Autosuggest
          key="origin"
          onSelectionAction={EndpointActions.setOrigin}
          onEmptyAction={EndpointActions.clearOrigin}
          placeholder={@context.intl.formatMessage(
            id: 'origin'
            defaultMessage: "From where? - address or stop")}
          value=origin.address
          id="origin"
          disableInput={@disableInputMode.bind(null, 'origin')}
        />
      else
        <NavigateOrInput
          setToCurrent={@setOriginToCurrent}
          enableInput={@enableInputMode}
          id='origin'
        />

    to =
      if destination.useCurrentPosition
        @getGeolocationBar(geolocation)
      else if @state.dest.userInput
        <Autosuggest
          key="destination"
          onSelectionAction={EndpointActions.setDestination}
          onEmptyAction={EndpointActions.clearDestination}
          placeholder={@context.intl.formatMessage(
            id: 'destination'
            defaultMessage: "Where to? - address or stop")}
          value=destination.address
          id="destination"
        />
      else
        <NavigateOrInput
          setToCurrent={@setDestinationToCurrent}
          enableInput={@enableInputMode}
          id='dest'
        />

    <SearchTwoFields from={from} to={to} onSwitch={@onSwitch} routeIfPossible={@routeIfPossible}/>

module.exports = SearchTwoFieldsContainer
