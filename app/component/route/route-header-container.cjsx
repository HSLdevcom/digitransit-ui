React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
RouteHeader           = require './route-header'
without               = require 'lodash/without'
FavouriteRoutesActions = require '../../action/favourite-routes-action'
connectToStores = require 'fluxible-addons-react/connectToStores'

class RouteHeaderContainer extends React.Component
  @contextTypes:
    executeAction: React.PropTypes.func.isRequired

  @propTypes:
    pattern: React.PropTypes.node.isRequired

  addFavouriteRoute: (e) =>
    e.stopPropagation()
    @context.executeAction FavouriteRoutesActions.addFavouriteRoute, @props.pattern.route.gtfsId

  render: =>
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
      favourite={@props.favourite}
      addFavouriteRoute={@addFavouriteRoute}>
    </RouteHeader>

RouteHeaderContainerWithFavourite = connectToStores RouteHeaderContainer, ['FavouriteRoutesStore'], (context, props) ->
  favourite: context.getStore('FavouriteRoutesStore').isFavourite(props.pattern.route.gtfsId)


module.exports = Relay.createContainer(RouteHeaderContainerWithFavourite, fragments: queries.RouteHeaderFragments)
