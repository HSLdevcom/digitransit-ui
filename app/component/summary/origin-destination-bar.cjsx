React = require 'react'
EndpointActions = require '../../action/endpoint-actions'
SearchModal               = require '../search/search-modal'
SearchInput               = require '../search/search-input'
Tab                       = require 'material-ui/lib/tabs/tab'
{intlShape}               = require 'react-intl'

class OriginDestinationBar extends React.Component

  constructor: ->
    @state =
      origin: ""
      destination: ""
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
      origin: @context.getStore('EndpointStore').getOrigin().address
      destination: @context.getStore('EndpointStore').getDestination().address

  closeModal: () =>
    @setState
      tabOpen: false

  render: ->
    <div className="origin-destination-bar">
      <span className="field-link" onClick={() => @setState(tabOpen: "origin")}>{@state.origin}</span>
      <span className="switch" onClick={() => @context.executeAction EndpointActions.swapEndpoints}>{'\u21c4'}</span>
      <span className="field-link" onClick={() => @setState(tabOpen: "destination")}>{@state.destination}</span>
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
          <SearchInput
            initialValue = {@state[@state.tabOpen]}
            type="endpoint"
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
