Dispatcher    = require '../dispatcher/dispatcher.coffee'

class FavouriteStopsActions

  addFavouriteStop: (stopId) ->
    Dispatcher.dispatch
      actionType: "AddFavouriteStop"
      stopId: stopId

module.exports = new FavouriteStopsActions