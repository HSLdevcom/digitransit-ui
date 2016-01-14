Store = require 'fluxible/addons/BaseStore'
moment = require 'moment'

class TimeStore extends Store
  # Stores the user-selected time centrally for the application
  # getTime always returns a valid moment object. Status is set either to UNSET
  # if the user has not selected a time, or SET if the time has been fixed.
  # The arriveBy-flags tells that the user has selected that he wants to arrive
  # before the selected time to his destination.

  @storeName: 'TimeStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @setSelectedTimeToNow()
    @setArriveBy(false)

  setSelectedTimeToNow: ->
    @time = moment()
    @status = "UNSET"
    @emitChange()
    setTimeout(
      =>
        if @status == "UNSET"
          @setSelectedTimeToNow()
      , 30 * 1000)  # Update twice in a minute

  setSelectedTime: (data) ->
    @time = data
    @status = "SET"
    @emitChange()

  setArriveBy: (arriveBy) ->
    @arriveBy = arriveBy
    @emitChange()

  getTime: ->
    @time

  getArriveBy: ->
    @arriveBy

  @handlers:
    'SetSelectedTime': 'setSelectedTime'
    'UnsetSelectedTime': 'setSelectedTimeToNow'
    'SetArriveBy': 'setArriveBy'

module.exports = TimeStore
