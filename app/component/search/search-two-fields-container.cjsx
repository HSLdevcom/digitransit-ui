React            = require 'react'
EndpointActions  = require '../../action/endpoint-actions.coffee'
PositionActions  = require '../../action/position-actions.coffee'
SearchActions    = require '../../action/search-actions.coffee'
{locationToOTP}  = require '../../util/otp-strings'
SearchTwoFields  = require './search-two-fields'
{getRoutePath}   = require '../../util/path'
SearchField      = require './search-field'
intl             = require 'react-intl'
FormattedMessage = intl.FormattedMessage
SearchModal      = require './search-modal'

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
      if @context.getStore('PositionStore').getLocationState().status == 'found-address'
        @routeIfPossible() #TODO: this should not be done here
      else
        @forceUpdate()

  onEndpointChange: () =>
    @forceUpdate()
    @routeIfPossible() #TODO: this should not be done here

  onSwitch: (e) =>
    e.preventDefault()
    if @context.getStore('EndpointStore').getOrigin().useCurrentPosition and @context.getStore('PositionStore').getLocationState().isLocationingInProgress
      return

    @context.executeAction EndpointActions.swapEndpoints

  pushNonSearchState: () =>
    if location.pathname != "/"
      setTimeout(() =>
        @context.history.pushState(null, "/")
      , 0)

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
        @context.history.pushState(null, getRoutePath(from, to))
      , 0)

  render: =>
    geolocation = @context.getStore('PositionStore').getLocationState()
    origin = @context.getStore('EndpointStore').getOrigin()
    destination = @context.getStore('EndpointStore').getDestination()

    focusInput = () =>
      @refs.modal?.refs.searchInput?.refs.autowhatever?.refs.input?.focus()

    originPlaceholder = @context.intl.formatMessage(
      id: 'origin'
      defaultMessage: 'From where? - address or stop')

    destinationPlaceholder = @context.intl.formatMessage(
      id: 'destination'
      defaultMessage: 'Where to? - address or stop')

    from =
      <SearchField
        endpoint={origin}
        geolocation={geolocation}
        onClick={(e) =>
          e.preventDefault()
          @context.executeAction SearchActions.openOriginSearch,
            position: origin
            placeholder: originPlaceholder
          focusInput()
        }
        autosuggestPlaceholder={originPlaceholder}
        navigateOrInputPlaceHolder={@context.intl.formatMessage(
          id: 'give-origin'
          defaultMessage: 'Type origin')}
        id='origin'
      />

    to =
      <SearchField
        endpoint={destination}
        geolocation={geolocation}
        onClick={(e) =>
          e.preventDefault()
          @context.executeAction SearchActions.openDestinationSearch,
            position: destination
            placeholder: destinationPlaceholder
          focusInput()
        }
        autosuggestPlaceholder={destinationPlaceholder}
        navigateOrInputPlaceHolder={@context.intl.formatMessage(
          id: 'give-destination'
          defaultMessage: 'Type destination')}
        id='destination'
      />

    <div>
      <SearchTwoFields from={from} to={to} onSwitch={@onSwitch} routeIfPossible={@routeIfPossible}/>
      <SearchModal ref="modal" initialPosition={destination}/>
    </div>

module.exports = SearchTwoFieldsContainer
