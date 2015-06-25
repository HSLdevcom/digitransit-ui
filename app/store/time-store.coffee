Store = require 'fluxible/addons/BaseStore'
moment = require 'moment'

class TimeStore extends Store
  @storeName: 'TimeStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @setCurrentTimeNow()
    @setArriveBy(false)

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

  setArriveBy: (arriveBy) ->
    @arriveBy = arriveBy
    @emitChange()

  getTime: ->
    @time

  getArriveBy: ->
    @arriveBy

  @handlers:
    'SetCurrentTime': 'setCurrentTime'
    'UnsetCurrentTime': 'setCurrentTimeNow'
    'SetArriveBy': 'setArriveBy'

module.exports = TimeStore
