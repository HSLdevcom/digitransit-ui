React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
RouteHeader           = require './route-header'
without               = require 'lodash/array/without'
FavouriteRoutesActions = require '../../action/favourite-routes-action'

class RouteHeaderContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  componentDidMount: ->
    @context.getStore('FavouriteRoutesStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('FavouriteRoutesStore').removeChangeListener @onChange

  onChange: (id) =>
    if !id or id == @props.route.route.gtfsId
      @forceUpdate()

  addFavouriteRoute: (e) =>
    e.stopPropagation()
    @context.executeAction FavouriteRoutesActions.addFavouriteRoute, @props.route.route.gtfsId

  render: =>
    routeId = @props.route.route.gtfsId
    patterns = @props.route.route.patterns.map (pattern) -> pattern.code
    reverseIds = without(patterns, @props.route.code)
    if reverseIds.length == 1
      reverseId = reverseIds[0]

    #TODO: all of trips should be reanmed pattern
    <RouteHeader
      className={@props.className}
      key={@props.route.code}
      route={@props.route.route}
      pattern={@props.route}
      trip={@props.trip}
      reverseId={reverseId}
      favourite={@context.getStore('FavouriteRoutesStore').isFavourite(routeId)}
      addFavouriteRoute={@addFavouriteRoute}>
    </RouteHeader>

module.exports = Relay.createContainer(RouteHeaderContainer, fragments: queries.RouteHeaderFragments)
