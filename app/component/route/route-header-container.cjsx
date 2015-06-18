React                 = require 'react'
RouteHeader           = require './route-header'
without               = require 'lodash/array/without'

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
    routeId = @props.id.split(':',2).join(':')
    reverseIds = without(p.id for p in (@context.getStore('RouteInformationStore').getRoutePatterns(routeId)), @props.id)
    if reverseIds.length == 1
      reverseId = reverseIds[0]

    <RouteHeader
      key={@props.id}
      route={@context.getStore('RouteInformationStore').getRoute(routeId)}
      pattern={@context.getStore('RouteInformationStore').getPattern(@props.id)}
      reverseId={reverseId}>
    </RouteHeader>

module.exports = RouteHeaderContainer