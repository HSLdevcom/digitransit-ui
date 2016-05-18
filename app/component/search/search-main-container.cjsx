React            = require 'react'
EndpointActions  = require '../../action/endpoint-actions'
SearchActions    = require '../../action/SearchActions'
FakeSearchWithButton = require './fake-search-with-button'
intl             = require 'react-intl'
FormattedMessage = intl.FormattedMessage
SearchModal      = require './search-modal'
Tab              = require('material-ui/Tabs/Tab').default
FakeSearchBar    = require './fake-search-bar'
GeolocationOrInput = require('./GeolocationOrInput').default

class SearchMainContainer extends React.Component

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
    @context.getStore('SearchStore').addChangeListener @onSearchChange

  componentWillUnmount: =>
    @context.getStore('SearchStore').removeChangeListener @onSearchChange


  onSearchChange: (payload) =>
    if payload.action == "open"
      @openDialog payload.data

  onTabChange: (tab) =>
    @setState
      selectedTab: tab.props.value
      () =>
        if tab.props.value == "origin"
          @context.executeAction SearchActions.executeSearch, {input: @context.getStore('EndpointStore').getOrigin()?.address || "", type: "endpoint"}
        if tab.props.value == "destination"
          @context.executeAction SearchActions.executeSearch, {input: @context.getStore('EndpointStore').getDestination()?.address || "", type: "endpoint"}
        if tab.props.value == "search"
          @context.executeAction SearchActions.executeSearch, {input: "", type: "search"}
        setTimeout((() => @focusInput(tab.props.value)), 0) #try to focus, does not work on ios

  closeModal: () =>
    @setState
      modalIsOpen: false

  focusInput: (value) =>
    @refs["searchInput" + value]?.refs.searchInput.refs.autowhatever?.refs.input?.focus()

  openDialog: (tab, cb) =>
    @setState
      selectedTab: tab
      modalIsOpen: true
      () -> if(cb) then cb()

  clickSearch: =>
    geolocation = @context.getStore('PositionStore').getLocationState()
    origin = @context.getStore('EndpointStore').getOrigin()

    tab = if origin.lat or origin.useCurrentPosition and geolocation.hasLocation then "destination" else "origin"
    @openDialog tab, () =>
      @focusInput if origin.lat or origin.useCurrentPosition and geolocation.hasLocation then "destination" else "origin"

    if origin.lat or origin.useCurrentPosition and geolocation.hasLocation
      @context.executeAction SearchActions.executeSearch, {input: @context.getStore('EndpointStore').getDestination()?.address || "", type: "endpoint"}
    else
      @context.executeAction SearchActions.executeSearch, {input: "", type: "endpoint"}


  render: =>
    origin = @context.getStore('EndpointStore').getOrigin()
    destination = @context.getStore('EndpointStore').getDestination()

    originSearchTabLabel = @context.intl.formatMessage
      id: 'origin'
      defaultMessage: 'Origin'

    destinationSearchTabLabel = @context.intl.formatMessage
      id: 'destination'
      defaultMessage: 'destination'

    searchTabLabel = @context.intl.formatMessage
      id: 'search'
      defaultMessage: 'SEARCH'

    destinationPlaceholder = @context.intl.formatMessage
      id: 'destination-placeholder'
      defaultMessage: 'Where to? - address or stop'

    fakeSearchBar =
      <FakeSearchBar
        onClick={@clickSearch}
        placeholder={destinationPlaceholder}
        id="front-page-search-bar"
      />

    <div>
      <FakeSearchWithButton fakeSearchBar={fakeSearchBar} onClick={@clickSearch}/>
      <SearchModal
        selectedTab={@state.selectedTab}
        modalIsOpen={@state.modalIsOpen}
        closeModal={@closeModal}>
        <Tab
          className={"search-header__button" + if @state.selectedTab == "origin" then "--selected" else ""}
          label={originSearchTabLabel}
          value="origin"
          id="origin"
          onActive={@onTabChange}>
            <GeolocationOrInput
              ref="searchInputorigin"
              id="search-origin"
              endpoint = {@context.getStore('EndpointStore').getOrigin()}
              type="endpoint"
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
          value="destination"
          id="destination"
          onActive={@onTabChange}>
          <GeolocationOrInput
            ref="searchInputdestination"
            endpoint = @context.getStore('EndpointStore').getDestination()
            id="search-destination"
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
          className={"search-header__button" + if @state.selectedTab == "search" then "--selected" else ""}
          label={searchTabLabel}
          value="search"
          onActive={@onTabChange}>
          <GeolocationOrInput
            ref="searchInputsearch"
            initialValue = ""
            id="search"
            type="search"
            onSuggestionSelected = {(name, item) =>
              if item.properties.link then @context.router.push item.properties.link
              @closeModal()
          }/>
        </Tab>
      </SearchModal>
    </div>

module.exports = SearchMainContainer
