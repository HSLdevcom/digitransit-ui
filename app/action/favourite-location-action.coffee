module.exports =
  'addFavouriteLocation': (actionContext, location) ->
    actionContext.dispatch "AddFavouriteLocation", location

  'getFavouriteLocation': (actionContext, location) ->
    actionContext.dispatch "GetFavouriteLocation", location
