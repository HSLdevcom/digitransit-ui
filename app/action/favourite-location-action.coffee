module.exports.addFavouriteLocation = (actionContext, location) ->
  actionContext.dispatch "AddFavouriteLocation", location
