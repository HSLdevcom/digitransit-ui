Dispatcher = require '../dispatcher/dispatcher.coffee'
Store = require './store.coffee'

class TimeStore extends Store
  constructor: ->
    super()
    @currentTime = @setCurrentTimeNow()
    @register()

  setCurrentTimeNow: ->
    now = new Date()
    @nowDate = @createPrefixZeroIfUnderTen(now.getDate()) 
    @nowMonth = @createPrefixZeroIfUnderTen(now.getMonth() + 1)
    @nowYear = now.getFullYear()
    @nowHour = now.getHours()
    @nowMinute = now.getMinutes()
    # Put timezone as e.g. "+0300"
    @timezone = '+' + @createPrefixZeroIfUnderTen((now.getTimezoneOffset() / 60) * -1) + '00'

  setCurrentTime: (date, hour, minute) ->
    now = new Date()
    if date == "today" 
      @nowDate = now.getDate()
    else 
      @nowDate = now.getDate()+1

    @nowMonth = @createPrefixZeroIfUnderTen(now.getMonth() + 1)
    @nowYear = now.getFullYear()
    @nowHour = hour
    @nowMinute = minute
  
  getTimeHour: () ->
    @nowHour

  getTimeMinute: () ->
    @nowMinute

  getDate: () ->
    pattern = @nowYear + "-" + @nowMonth + "-" + @nowDate + "T" + @nowHour + ":" + @nowMinute + @timezone
    new Date(pattern)

  createPrefixZeroIfUnderTen: (number) ->
    if number < 10 
      return '0' + number
    else 
      return '' + number

  register: -> 
    @dispatchToken = Dispatcher.register (action) =>
      switch action.actionType
        when "SetCurrentTime" then @setCurrentTime(action.date, action.hour, action.minute)
      
module.exports = new TimeStore()