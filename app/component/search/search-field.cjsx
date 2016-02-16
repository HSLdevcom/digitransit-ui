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

  @propTypes:
    endpoint: React.PropTypes.object.isRequired
    geolocation: React.PropTypes.object.isRequired
    autosuggestPlaceholder: React.PropTypes.string.isRequired
    navigateOrInputPlaceHolder: React.PropTypes.string.isRequired
    id: React.PropTypes.string.isRequired
    onClick: React.PropTypes.func.isRequired

  getGeolocationBar: =>
    <div id={@props.id} onClick={(e) =>
      @props.onClick(e)
      }>
      <GeolocationBar
        geolocation={@props.geolocation}
        id={@props.id + "-geolocationbar"}
      />
    </div>

  render: =>

    if @props.endpoint?.useCurrentPosition
      return @getGeolocationBar()
    if !@context.getStore('EndpointStore').isCurrentPositionInUse() && !@props.endpoint.userSetPosition
      hidden1 = false
    else
      hidden1 = true

    <div id={@props.id} onClick={(e) =>
      @props.onClick(e)
      }>
      <FakeSearchBar
        onClick={@props.onClick}
        placeholder={@props.autosuggestPlaceholder}
        value={@props.endpoint?.address}
        id={@props.id + "-fake-search-bar"}
      />
      <NavigateOrInput
        placeholder={@props.autosuggestPlaceholder}
        id={@props.id + "-navigate-or-input"}
        text={@props.navigateOrInputPlaceHolder}
        visibility={if hidden1 then "hidden" else "visible"}
      />
    </div>

module.exports = SearchField
