Dispatcher    = require '../dispatcher/dispatcher.coffee'

class TimeActions

  setCurrentTime: (date, hour, minute) ->
    Dispatcher.dispatch
      actionType: "SetCurrentTime"
      date: date
      hour: hour
      minute: minute

module.exports = new TimeActions