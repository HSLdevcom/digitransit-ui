React          = require 'react'
GeolocationBar = require './geolocation-bar'
SearchInput    = require './search-input'
Icon           = require '../icon/icon'

class GeolocationOrInput extends React.Component

  constructor: (props) ->
    super
    console.log("endpoint:", props.endpoint)
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
    console.log("component will mount props:", @props)
    if typeof @props.endpoint != "undefined"
      @setStateFromEndpoint @props.endpoint

  componentWillReceiveProps: (newProps) =>
    console.log("new props are being received:", newProps)

  render: =>

    console.log("props @render:", @state.geolocation, @props)

    child = if @state.geolocation == false then <div id="clear-input" onClick={() => console.log("clear")}><Icon img='icon-icon_close'/></div>
    else <GeolocationBar geolocation={hasLocation: true} onClick={() => @setState geolocation: false}/>

    <SearchInput {...@props} initialValue={getInitialValue(@props)}>
      {child}
    </SearchInput>

  displayName = "GeolocationOrInput"

module.exports = GeolocationOrInput
