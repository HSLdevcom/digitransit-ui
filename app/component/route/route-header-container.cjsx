React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
RouteHeader           = require './route-header'
without               = require 'lodash/without'
FavouriteRoutesActions = require '../../action/favourite-routes-action'

class RouteHeaderContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  @propTypes:
    pattern: React.PropTypes.node.isRequired

  componentDidMount: ->
    @context.getStore('FavouriteRoutesStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('FavouriteRoutesStore').removeChangeListener @onChange

  onChange: (id) =>
    if !id or id == @props.pattern.route.gtfsId
      @forceUpdate()

  addFavouriteRoute: (e) =>
    e.stopPropagation()
    @context.executeAction FavouriteRoutesActions.addFavouriteRoute, @props.pattern.route.gtfsId

  render: =>
    routeId = @props.pattern.route.gtfsId
    patterns = @props.pattern.route.patterns.map (pattern) -> pattern.code
    reverseIds = without(patterns, @props.pattern.code)
    if reverseIds.length == 1
      reverseId = reverseIds[0]

    <RouteHeader
      className={@props.className}
      key={@props.pattern.code}
      route={@props.pattern.route}
      pattern={@props.pattern}
      trip={@props.trip}
      reverseId={reverseId}
      favourite={@context.getStore('FavouriteRoutesStore').isFavourite(routeId)}
      addFavouriteRoute={@addFavouriteRoute}>
    </RouteHeader>


module.exports = Relay.createContainer(RouteHeaderContainer, fragments: queries.RouteHeaderFragments)
