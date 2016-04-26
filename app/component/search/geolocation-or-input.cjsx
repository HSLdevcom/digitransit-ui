React          = require 'react'
GeolocationBar = require './geolocation-bar'
SearchInput    = require './search-input'
Icon           = require '../icon/icon'

class GeolocationOrInput extends React.Component

  constructor: (props) ->
    super
    @state = {geolocation: false}

  setStateFromEndpoint: (endpoint) =>
    if endpoint.useCurrentPosition
      @setState
        geolocation: endpoint.useCurrentPosition

  getInitialValue = (props) ->
    if typeof props.endpoint != "undefined"
      props.endpoint.address || ""
    else
      props.initialValue

  componentWillMount: =>
    if typeof @props.endpoint != "undefined"
      @setStateFromEndpoint @props.endpoint

  render: =>
    child = if @state.geolocation == false then null
    else <GeolocationBar geolocation={hasLocation: true} onClick={() => @setState geolocation: false}/>

    <SearchInput ref="searchInput" {...@props} initialValue={getInitialValue(@props)}>
      {child}
    </SearchInput>

  displayName = "GeolocationOrInput"

module.exports = GeolocationOrInput
