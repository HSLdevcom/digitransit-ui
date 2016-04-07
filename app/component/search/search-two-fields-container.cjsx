React            = require 'react'
EndpointActions  = require '../../action/endpoint-actions'
PositionActions  = require '../../action/position-actions'
SearchActions    = require '../../action/search-actions'
{locationToOTP}  = require '../../util/otp-strings'
SearchTwoFields  = require './search-two-fields'
{getRoutePath}   = require '../../util/path'
SearchField      = require './search-field'
intl             = require 'react-intl'
FormattedMessage = intl.FormattedMessage
SearchModal      = require './search-modal'
SearchInput      = require './search-input'
Tab              = require 'material-ui/lib/tabs/tab'

class SearchTwoFieldsContainer extends React.Component

  constructor: () ->
    @state =
      selectedTab: "destination"
      modalIsOpen: false

  @contextTypes:
    executeAction: React.PropTypes.func.isRequired
    getStore: React.PropTypes.func.isRequired
    router: React.PropTypes.object.isRequired
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

  onTabChange: (tab) =>
    @setState
      selectedTab: tab.props.value
      () =>
        if tab.props.value == "origin"
          @context.executeAction SearchActions.executeSearch, {input: @context.getStore('EndpointStore').getOrigin()?.address || "", type: "endpoint"}
        if tab.props.value == "destination"
          @context.executeAction SearchActions.executeSearch, {input: @context.getStore('EndpointStore').getDestination()?.address || "", type: "endpoint"}
        if tab.props.value == "search"
          @context.executeAction SearchActions.executeSearch, {input: ""}
    setTimeout((() => @focusInput(tab.props.value)), 0) #try to focus, does not work on ios

  closeModal: () =>
    @setState
      modalIsOpen: false

  focusInput: (value) =>
    @refs["searchInput" + value]?.refs.autowhatever?.refs.input?.focus()

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
        @context.router.push getRoutePath(from, to)
      , 0)

  render: =>
    geolocation = @context.getStore('PositionStore').getLocationState()
    origin = @context.getStore('EndpointStore').getOrigin()
    destination = @context.getStore('EndpointStore').getDestination()

    originSearchTabLabel = @context.intl.formatMessage(
      id: 'origin'
      defaultMessage: 'ORIGIN'
    )

    destinationSearchTabLabel = @context.intl.formatMessage(
      id: 'destination'
      defaultMessage: 'DESTINATION'
    )

    searchTabLabel = @context.intl.formatMessage(
      id: 'search'
      defaultMessage: 'SEARCH'
    )

    originPlaceholder = @context.intl.formatMessage(
      id: 'origin-placeholder'
      defaultMessage: 'From where? - address or stop')

    destinationPlaceholder = @context.intl.formatMessage(
      id: 'destination-placeholder'
      defaultMessage: 'Where to? - address or stop')

    from =
      <SearchField
        endpoint={origin}
        geolocation={geolocation}
        onClick={(e) =>
          @setState
            selectedTab: "origin"
            modalIsOpen: true
            () =>
              @focusInput("origin")
          @context.executeAction SearchActions.executeSearch, {"input": @context.getStore('EndpointStore').getOrigin()?.address || "", type: "endpoint"}}
        autosuggestPlaceholder={originPlaceholder}
        id='origin'
      />

    to =
      <SearchField
        endpoint={destination}
        geolocation={geolocation}
        onClick={(e) =>
          @setState
            selectedTab: "destination"
            modalIsOpen: true
            () =>
              @focusInput("destination")
          @context.executeAction SearchActions.executeSearch, {"input": @context.getStore('EndpointStore').getDestination()?.address || "", type: "endpoint"}}
        autosuggestPlaceholder={destinationPlaceholder}
        id='destination'
      />

    <div>
      <SearchTwoFields from={from} to={to} onSwitch={@onSwitch} routeIfPossible={@routeIfPossible}/>
      <SearchModal
        ref="modal"
        selectedTab={@state.selectedTab}
        modalIsOpen={@state.modalIsOpen}
        closeModal={@closeModal}>
        <Tab
          className={"search-header__button" + if @state.selectedTab == "origin" then "--selected" else ""}
          label={originSearchTabLabel}
          ref="searchTab"
          value={"origin"}
          onActive={@onTabChange}>
            <SearchInput
              ref="searchInputorigin"
              id="search-origin"
              initialValue = {@context.getStore('EndpointStore').getOrigin()?.address || ""}
              onSuggestionSelected = {(name, item) =>
                if item.type == 'CurrentLocation'
                  @context.executeAction EndpointActions.setUseCurrent, "origin"
                else
                  @context.executeAction EndpointActions.setEndpoint,
                    "target": "origin",
                    "endpoint":
                      lat: item.geometry.coordinates[1]
                      lon: item.geometry.coordinates[0]
                      address: name
                @closeModal()
            }/>
        </Tab>
        <Tab
          className={"search-header__button" + if @state.selectedTab == "destination" then "--selected" else ""}
          label={destinationSearchTabLabel}
          value={"destination"}
          ref="searchTab"
          onActive={@onTabChange}>
          <SearchInput
            ref="searchInputdestination"
            initialValue = {@context.getStore('EndpointStore').getDestination()?.address || ""}
            id={"search-destination"}
            type="endpoint"
            onSuggestionSelected = {(name, item) =>
              if item.type == 'CurrentLocation'
                @context.executeAction EndpointActions.setUseCurrent, 'destination'
              else
                @context.executeAction EndpointActions.setEndpoint,
                  "target": "destination",
                  "endpoint":
                    lat: item.geometry.coordinates[1]
                    lon: item.geometry.coordinates[0]
                    address: name
              @closeModal()
          }/>
        </Tab>
        <Tab
          className="search-header__button"
          label={searchTabLabel}
          value={"search"}
          ref="searchTab"
          type="search"
          onActive={@onTabChange}>
          <SearchInput
            ref="searchInputdestination"
            initialValue = ""}
            id={"search"}
            onSuggestionSelected = {(name, item) =>
              console.log("suggestion selected", name, item)
              if item.properties.link then @context.router.push item.properties.link
              @closeModal()
          }/>
        </Tab>
      </SearchModal>
    </div>

module.exports = SearchTwoFieldsContainer
