Store = require 'fluxible/addons/BaseStore'
moment = require 'moment'

class TimeStore extends Store
  @storeName: 'TimeStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @setCurrentTimeNow()

  setCurrentTimeNow: ->
    @time = moment()
    @status = "UNSET"
    @emitChange()
    setTimeout =>
      if @status == "UNSET"
        @setCurrentTimeNow()
    , 60*1000 #Update each minute

  setCurrentTime: (data) ->
    @time = data
    @status = "SET"
    @emitChange()

  getTimeHour: ->
    @time.format('HH')

  getTimeMinute: ->
    @time.format('mm')

  getTime: ->
    @time

  @handlers:
    'SetCurrentTime': 'setCurrentTime'
    'UnsetCurrentTime': 'setCurrentTimeNow'

module.exports = TimeStore
