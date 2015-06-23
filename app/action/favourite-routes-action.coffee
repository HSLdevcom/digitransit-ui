module.exports = addFavouriteRoute: (actionContext, routeId) ->
  actionContext.dispatch "AddFavouriteRoute", routeId
