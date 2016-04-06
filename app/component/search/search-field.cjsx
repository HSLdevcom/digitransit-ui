React           = require 'react'
GeolocationBar  = require './geolocation-bar'
FakeSearchBar   = require './fake-search-bar'

class SearchField extends React.Component

  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  @propTypes:
    endpoint: React.PropTypes.object.isRequired
    geolocation: React.PropTypes.object.isRequired
    autosuggestPlaceholder: React.PropTypes.string.isRequired
    id: React.PropTypes.string.isRequired
    onClick: React.PropTypes.func.isRequired
    className: React.PropTypes.string

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
        className={@props.className}
        onClick={@props.onClick}
        placeholder={@props.autosuggestPlaceholder}
        value={@props.endpoint?.address}
        id={@props.id + "-fake-search-bar"}
      />
    </div>

module.exports = SearchField
