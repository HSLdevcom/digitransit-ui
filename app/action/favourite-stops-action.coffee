module.exports = addFavouriteStop: (actionContext, stopId) ->
  actionContext.dispatch "AddFavouriteStop", stopId
