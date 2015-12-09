React = require 'react'
EndpointActions  = require '../../action/endpoint-actions.coffee'
PositionActions  = require '../../action/position-actions.coffee'
{locationToOTP} = require '../../util/otp-strings'
SearchTwoFields = require './search-two-fields'
SearchField     = require './search-field'

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
    @context.getStore('PositionStore').addChangeListener @onGeolocationChange

  componentWillUnmount: =>
    @context.getStore('EndpointStore').removeChangeListener @onEndpointChange
    @context.getStore('PositionStore').removeChangeListener @onGeolocationChange

  onGeolocationChange: (statusChanged) =>
    #We want to rerender only if position status changes,
    #not if position changes
    if statusChanged
      @forceUpdate()

  onEndpointChange: () =>
    @forceUpdate()

    @routeIfPossible() #TODO: this should not be done here

  onSwitch: (e) =>
    e.preventDefault()
    if @context.getStore('EndpointStore').getOrigin().useCurrentPosition and @context.getStore('PositionStore').getLocationState().isLocationingInProgress
      return

    @context.executeAction EndpointActions.swapOriginDestination

  routeIfPossible: =>
    geolocation = @context.getStore('PositionStore').getLocationState()
    origin = @context.getStore('EndpointStore').getOrigin()
    destination = @context.getStore('EndpointStore').getDestination()

    if ((origin.lat or origin.useCurrentPosition and geolocation.hasLocation) and
        (destination.lat or destination.useCurrentPosition and geolocation.hasLocation))

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

  render: =>
    geolocation = @context.getStore('PositionStore').getLocationState()
    origin = @context.getStore('EndpointStore').getOrigin()
    destination = @context.getStore('EndpointStore').getDestination()

    from =
      <SearchField
        endpoint={origin}
        geolocation={geolocation}
        setToCurrent={() => @context.executeAction EndpointActions.setOriginToCurrent}
        enableInputMode={() => @context.executeAction EndpointActions.enableOriginInputMode}
        disableInputMode={() => @context.executeAction EndpointActions.disableOriginInputMode}
        clear={() => @context.executeAction EndpointActions.clearOrigin}
        autosuggestPlaceholder={@context.intl.formatMessage(
          id: 'origin'
          defaultMessage: 'From where? - address or stop')}
        navigateOrInputPlaceHolder={@context.intl.formatMessage(
          id: 'give-origin'
          defaultMessage: 'Type origin')}
        id='origin'
        onSelectAction={EndpointActions.setOrigin}
      />

    to =
      <SearchField
        endpoint={destination}
        geolocation={geolocation}
        setToCurrent={() => @context.executeAction EndpointActions.setDestinationToCurrent}
        enableInputMode={() => @context.executeAction EndpointActions.enableDestinationInputMode}
        disableInputMode={() => @context.executeAction EndpointActions.disableDestinationInputMode}
        clear={() => @context.executeAction EndpointActions.clearDestination}
        autosuggestPlaceholder={@context.intl.formatMessage(
          id: 'destination'
          defaultMessage: 'Where to? - address or stop')}
        navigateOrInputPlaceHolder={@context.intl.formatMessage(
          id: 'give-destination'
          defaultMessage: 'Type destination')}
        id='destination'
        onSelectAction={EndpointActions.setDestination}
      />

    <SearchTwoFields from={from} to={to} onSwitch={@onSwitch} routeIfPossible={@routeIfPossible}/>

module.exports = SearchTwoFieldsContainer
