Store = require 'fluxible/addons/BaseStore'

class TimeStore extends Store
  @storeName: 'TimeStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @currentTime = @setCurrentTimeNow()

  setCurrentTimeNow: ->
    now = new Date()
    @nowDate = @createPrefixZeroIfUnderTen(now.getDate()) 
    @nowMonth = @createPrefixZeroIfUnderTen(now.getMonth() + 1)
    @nowYear = now.getFullYear()
    @nowHour = now.getHours()
    @nowMinute = now.getMinutes()
    # Put timezone as e.g. "+0300"
    @timezone = '+' + @createPrefixZeroIfUnderTen((now.getTimezoneOffset() / 60) * -1) + '00'

  setCurrentTime: (data) ->
    now = new Date()
    if data.date == "today" 
      @nowDate = now.getDate()
    else 
      @nowDate = now.getDate()+1

    @nowMonth = @createPrefixZeroIfUnderTen(now.getMonth() + 1)
    @nowYear = now.getFullYear()
    @nowHour = data.hour
    @nowMinute = data.minute
  
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

  @handlers:
    'SetCurrentTime': 'setCurrentTime'
      
module.exports = TimeStore