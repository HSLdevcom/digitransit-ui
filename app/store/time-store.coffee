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
    @currentTime = moment()
    @arriveBy = false
    @setSelectedTimeToNow()

  setSelectedTimeToNow: ->
    @selectedTime = @currentTime
    @status = "UNSET"
    @emitChange()
    twicePerMinute = 30 * 1000
    setTimeout @updateSelectedTime, twicePerMinute

  updateSelectedTime: =>
    if @status == "UNSET"
      @setSelectedTimeToNow()

  setSelectedTime: (data) ->
    @selectedTime = data
    @status = "SET"
    @emitChange()

  setCurrentTime: (data) ->
    @currentTime = data
    @emitChange()

  setArriveBy: (arriveBy) ->
    @arriveBy = arriveBy
    @emitChange()

  getSelectedTime: ->
    @selectedTime

  getCurrentTime: ->
    @currentTime

  getArriveBy: ->
    @arriveBy

  @handlers:
    'SetSelectedTime': 'setSelectedTime'
    'UnsetSelectedTime': 'setSelectedTimeToNow'
    'SetArriveBy': 'setArriveBy'

module.exports = TimeStore
