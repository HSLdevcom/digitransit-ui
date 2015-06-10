React                 = require 'react'
RouteHeader           = require './route-header'

class RouteHeaderContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  componentDidMount: -> 
    @context.getStore('RouteInformationStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('RouteInformationStore').removeChangeListener @onChange

  onChange: (id) =>
    if !id or id == @props.id or id == @props.id.split(':',2).join(':')
      @forceUpdate()

  #addFavouriteStop: (e) =>
  #  e.stopPropagation()
  #  @context.executeAction FavouriteStopsActions.addFavouriteStop, @props.stop.id
  
  render: =>
    <RouteHeader
      key={@props.id}
      route={@context.getStore('RouteInformationStore').getRoute(@props.id.split(':',2).join(':'))}
      pattern={@context.getStore('RouteInformationStore').getPattern(@props.id)}>
    </RouteHeader>

module.exports = RouteHeaderContainer