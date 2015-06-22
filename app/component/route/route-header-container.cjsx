React                 = require 'react'
RouteHeader           = require './route-header'
without               = require 'lodash/array/without'
FavouriteRoutesActions = require '../../action/favourite-routes-action'

class RouteHeaderContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  componentDidMount: -> 
    @context.getStore('RouteInformationStore').addChangeListener @onChange
    @context.getStore('FavouriteRoutesStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('RouteInformationStore').removeChangeListener @onChange
    @context.getStore('FavouriteRoutesStore').removeChangeListener @onChange

  onChange: (id) =>
    if !id or id == @props.id or id == @props.id.split(':',2).join(':')
      @forceUpdate()

  addFavouriteRoute: (e) =>
    e.stopPropagation()
    @context.executeAction FavouriteRoutesActions.addFavouriteRoute, @props.id.split(':',2).join(':')
  
  render: =>
    routeId = @props.id.split(':',2).join(':')
    reverseIds = without(p.id for p in (@context.getStore('RouteInformationStore').getRoutePatterns(routeId)), @props.id)
    if reverseIds.length == 1
      reverseId = reverseIds[0]

    <RouteHeader
      key={@props.id}
      route={@context.getStore('RouteInformationStore').getRoute(routeId)}
      pattern={@context.getStore('RouteInformationStore').getPattern(@props.id)}
      reverseId={reverseId}
      favourite={@context.getStore('FavouriteRoutesStore').isFavourite(routeId)}
      addFavouriteRoute={@addFavouriteRoute}>
    </RouteHeader>

module.exports = RouteHeaderContainer