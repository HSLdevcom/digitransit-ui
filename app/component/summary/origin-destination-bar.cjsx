React               = require 'react'
EndpointActions     = require '../../action/endpoint-actions'
SearchModal         = require '../search/search-modal'
GeolocationOrInput  = require '../search/geolocation-or-input'
Tab                 = require 'material-ui/lib/tabs/tab'
{intlShape}         = require 'react-intl'
Icon                = require '../icon/icon'

class OriginDestinationBar extends React.Component

  constructor: ->
    @state =
      origin: undefined
      destination: undefined
      tabOpen: false

  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    intl: intlShape.isRequired

  componentWillMount: =>
    @onEndpointChange()
    @context.getStore('EndpointStore').addChangeListener @onEndpointChange

  componentWillUnmount: =>
    @context.getStore('EndpointStore').removeChangeListener @onEndpointChange

  onEndpointChange: () =>
    @setState
      origin: @context.getStore('EndpointStore').getOrigin()
      destination: @context.getStore('EndpointStore').getDestination()

  closeModal: () =>
    @setState
      tabOpen: false

  render: ->
    ownPosition = @context.intl.formatMessage
      id: 'own-position'
      defaultMessage: 'Your current location'

    initialValue =
      if @state[@state.tabOpen]
        if @state[@state.tabOpen].useCurrentPosition
          ownPosition
        else
          @state[@state.tabOpen].address
      else
        ""

    <div className="origin-destination-bar">
      <div className="field-link" onClick={() => @setState(tabOpen: "origin")}>
        <span>{if @state.origin.useCurrentPosition then ownPosition else @state.origin.address}</span>
      </div>
      <div className="switch" onClick={() => @context.executeAction EndpointActions.swapEndpoints}>
        <span><Icon img="icon-icon_direction-b"/></span>
      </div>
      <div className="field-link" onClick={() => @setState(tabOpen: "destination")}>
        <span>{if @state.destination.useCurrentPosition then ownPosition else @state.destination.address}</span>
      </div>
      <SearchModal
        ref="modal"
        selectedTab="tab"
        modalIsOpen={@state.tabOpen}
        closeModal={@closeModal}>
        <Tab
          className="search-header__button--selected"
          label={@context.intl.formatMessage
            id: @state.tabOpen or "origin"
            defaultMessage: @state.tabOpen}
          ref="searchTab"
          value="tab">
          <GeolocationOrInput
            initialValue = {initialValue}
            type="endpoint"
            endpoint={@state[@state.tabOpen]}
            onSuggestionSelected = {(name, item) =>
              if item.type == 'CurrentLocation'
                @context.executeAction EndpointActions.setUseCurrent, @state.tabOpen
              else
                @context.executeAction EndpointActions.setEndpoint,
                  "target": @state.tabOpen,
                  "endpoint":
                    lat: item.geometry.coordinates[1]
                    lon: item.geometry.coordinates[0]
                    address: name
              @closeModal()
          }/>
      </Tab>
      </SearchModal>
    </div>

module.exports = OriginDestinationBar
