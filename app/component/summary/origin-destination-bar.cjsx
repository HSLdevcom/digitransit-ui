React = require 'react'
Icon = require '../icon/icon'

class OriginDestinationBar extends React.Component

  constructor: ->
    @state =
      origin: ""
      destination: ""

  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  componentWillMount: =>
    @onEndpointChange()
    @context.getStore('EndpointStore').addChangeListener @onEndpointChange

  componentWillUnmount: =>
    @context.getStore('EndpointStore').removeChangeListener @onEndpointChange

  onEndpointChange: () =>
    @setState
      origin: @context.getStore('EndpointStore').getOrigin().address
      destination: @context.getStore('EndpointStore').getDestination().address

  render: ->
    <div className="origin-destination-bar">
      <span className="field-link">{@state.origin}</span>
      <span className="switch"><Icon img="icon-icon_direction-b"/></span>
      <span className="field-link">{@state.destination}</span>
    </div>

module.exports = OriginDestinationBar
