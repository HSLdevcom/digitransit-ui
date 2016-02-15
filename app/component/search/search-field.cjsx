React           = require 'react'
EndpointActions = require '../../action/endpoint-actions'
GeolocationBar  = require './geolocation-bar'
NavigateOrInput = require './navigate-or-input'
PositionActions = require '../../action/position-actions'
FakeSearchBar   = require './fake-search-bar'

class SearchField extends React.Component

  @contextTypes:
    executeAction: React.PropTypes.func.isRequired
    getStore: React.PropTypes.func.isRequired
    history: React.PropTypes.object.isRequired

  @propTypes:
    endpoint: React.PropTypes.object.isRequired
    geolocation: React.PropTypes.object.isRequired
    onSelectAction: React.PropTypes.func.isRequired
    autosuggestPlaceholder: React.PropTypes.string.isRequired
    navigateOrInputPlaceHolder: React.PropTypes.string.isRequired
    id: React.PropTypes.string.isRequired
    focus: React.PropTypes.func.isRequired

  getGeolocationBar: =>
    <GeolocationBar onClick={@props.onClick}
      geolocation={@props.geolocation}
      removePosition={() => @context.executeAction EndpointActions.clearGeolocation}
      locateUser={() => @context.executeAction PositionActions.findLocation}
      id={@props.id + "-geolocationbar"}
    />

  render: =>

    if @props.endpoint?.useCurrentPosition
      return @getGeolocationBar()
    if !@context.getStore('EndpointStore').isCurrentPositionInUse() && !@props.endpoint.userSetPosition
      hidden1 = false
    else
      hidden1 = true

    <div onClick={(e) =>
      @props.onClick(e)
      } className="search-form" style={"paddingTop": "0"}>
      <FakeSearchBar
        onClick={@props.onClick}
        placeholder={@props.autosuggestPlaceholder}
        value={@props.endpoint?.address}
      />
      <NavigateOrInput
        setToCurrent={@props.setToCurrent}
        enableInput={() =>
          @props.enableInputMode()
          ## safari...
          @refs.autosuggest.focusInput()
        }
        placeholder={@props.autosuggestPlaceholder}
        id={@props.id + "-placeholder"}
        text={@props.navigateOrInputPlaceHolder}
        visibility={if hidden1 then "hidden" else "visible"}
      />
    </div>

module.exports = SearchField
