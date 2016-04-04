Store = require 'fluxible/addons/BaseStore'
moment = require 'moment'

class TimeStore extends Store
  # Stores the user-selected time centrally for the application
  # getCurrentTime/getSelectedTime always returns a valid moment object. Status is set either to UNSET
  # if the user has not selected a time, or SET if the time has been fixed.
  # The arriveBy-flags tells that the user has selected that he wants to arrive
  # before the selected time to his destination.

  @storeName: 'TimeStore'

  twicePerMinute = 30 * 1000

  constructor: (dispatcher) ->
    super(dispatcher)
    @updateCurrentTime()
    @arriveBy = false
    @setSelectedTimeToNow()

  setSelectedTimeToNow: ->
    @selectedTime = @currentTime
    @status = "UNSET"
    @emitChange
      selectedTime: @selectedTime
    setTimeout @updateSelectedTime, twicePerMinute

  isSelectedTimeSet: =>
    @status == "SET"

  updateCurrentTime: =>
    @setCurrentTime moment()
    setTimeout @updateCurrentTime, twicePerMinute

  updateSelectedTime: =>
    unless @isSelectedTimeSet()
      @setSelectedTimeToNow()

  setSelectedTime: (data) ->
    @selectedTime = data
    @status = "SET"
    @emitChange
      selectedTime: @selectedTime

  setCurrentTime: (data) ->
    @currentTime = data
    @emitChange
      currentTime: @selectedTime

  setArriveBy: (arriveBy) ->
    @arriveBy = arriveBy
    @emitChange
      selectedTime: @selectedTime


  getSelectedTime: ->
    @selectedTime.clone()

  getCurrentTime: ->
    @currentTime.clone()

  getArriveBy: ->
    @arriveBy

  @handlers:
    'SetSelectedTime': 'setSelectedTime'
    'UnsetSelectedTime': 'setSelectedTimeToNow'
    'SetArriveBy': 'setArriveBy'

module.exports = TimeStore
