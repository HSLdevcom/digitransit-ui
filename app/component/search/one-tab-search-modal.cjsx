React               = require 'react'
Tab                 = require('material-ui/Tabs/Tab').default
GeolocationOrInput  = require "./geolocation-or-input"
EndpointActions     = require '../../action/endpoint-actions'
SearchModal         = require './search-modal'
{intlShape}         = require 'react-intl'

class OneTabSearchModal extends React.Component

  @contextTypes:
    executeAction: React.PropTypes.func.isRequired
    intl: intlShape.isRequired

  componentDidUpdate: (prevProps, prevState) ->
    if @props.modalIsOpen
      setTimeout(
        (() => @refs.geolocationOrInput?.refs.searchInput.refs.autowhatever?.refs.input?.focus()),
        0) #try to focus, does not work on ios

  render: ->

    <SearchModal
      ref="modal"
      selectedTab="tab"
      modalIsOpen={@props.modalIsOpen}
      closeModal={@props.closeModal}>
      <Tab
        className="search-header__button--selected"
        label={@context.intl.formatMessage
          id: @props.tabLabel
          defaultMessage: @props.tabLabel}
        ref="searchTab"
        value="tab">
        <GeolocationOrInput
          ref="geolocationOrInput"
          initialValue={@props.initialValue}
          type="endpoint"
          endpoint={@props.endpoint}
          onSuggestionSelected = {
            if @props.customOnSuggestionSelected then @props.customOnSuggestionSelected else
            (name, item) =>
              if item.type == 'CurrentLocation'
                @context.executeAction EndpointActions.setUseCurrent, @props.endpoint.target
              else
                @context.executeAction EndpointActions.setEndpoint,
                  "target": @props.endpoint.target,
                  "endpoint":
                    lat: item.geometry.coordinates[1]
                    lon: item.geometry.coordinates[0]
                    address: name
              @props.closeModal()
        }/>
    </Tab>
    </SearchModal>

module.exports = OneTabSearchModal
