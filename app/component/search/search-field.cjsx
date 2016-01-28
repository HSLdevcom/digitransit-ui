React           = require 'react'
EndpointActions = require '../../action/endpoint-actions'
Autosuggest     = require './autosuggest'
GeolocationBar  = require './geolocation-bar'
NavigateOrInput = require './navigate-or-input'
PositionActions = require '../../action/position-actions'

class SearchField extends React.Component

  @contextTypes:
    executeAction: React.PropTypes.func.isRequired
    getStore: React.PropTypes.func.isRequired
    history: React.PropTypes.object.isRequired

  @propTypes:
    endpoint: React.PropTypes.object.isRequired
    geolocation: React.PropTypes.object.isRequired
    setToCurrent: React.PropTypes.func.isRequired
    enableInputMode: React.PropTypes.func.isRequired
    disableInputMode: React.PropTypes.func.isRequired
    onSelectAction: React.PropTypes.func.isRequired
    autosuggestPlaceholder: React.PropTypes.string.isRequired
    navigateOrInputPlaceHolder: React.PropTypes.string.isRequired
    id: React.PropTypes.string.isRequired
    focus: React.PropTypes.func.isRequired
    onEmpty: React.PropTypes.func.isRequired


  getGeolocationBar: =>
    <GeolocationBar
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

    <div>
      <Autosuggest
        ref="autosuggest"
        key={@props.endpoint.address}
        onSelectionAction={@props.onSelectAction}
        placeholder={@props.autosuggestPlaceholder}
        value={@props.endpoint?.address}
        id={@props.id + "-autosuggest"}
        disableInput={@props.disableInputMode}
        onEmpty= {@props.onEmpty}
        focus={@props.focus}
        visibility={if hidden1 then  "visible" else "hidden"}
      />
      <NavigateOrInput
        setToCurrent={@props.setToCurrent}
        enableInput={() =>
          @props.enableInputMode()
          ## safari...
          @refs.autosuggest.focusInput()
        }
        id={@props.id + "-placeholder"}
        text={@props.navigateOrInputPlaceHolder}
        visibility={if hidden1 then "hidden" else "visible"}
      />
    </div>

module.exports = SearchField
