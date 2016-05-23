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
    @arriveBy = false
    @status = "UNSET"
    @updateSelectedTime()

  isSelectedTimeSet: =>
    @status == "SET"

  updateCurrentTime: =>
    @setCurrentTime moment()
    unless @isSelectedTimeSet()
      @updateSelectedTime()
    setTimeout @updateCurrentTime, twicePerMinute

  updateSelectedTime: =>
    @selectedTime = moment()
    @emitChange
      selectedTime: @selectedTime

  setSelectedTime: (data) ->
    @selectedTime = data
    @status = "SET"
    @emitChange
      selectedTime: @selectedTime

  setCurrentTime: (data) ->
    @currentTime = data
    @emitChange
      currentTime: @currentTime

  setArriveBy: (arriveBy) ->
    @arriveBy = arriveBy
    @emitChange
      selectedTime: @selectedTime

  setArrivalTime: (arrivalTime) ->
    @arriveBy = true
    @setSelectedTime arrivalTime

  setDepartureTime: (departureTime) ->
    @arriveBy = false
    @setSelectedTime departureTime

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
    'SetArrivalTime': 'setArrivalTime'
    'SetDepartureTime': 'setDepartureTime'

module.exports = TimeStore
