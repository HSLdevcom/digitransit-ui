Store = require 'fluxible/addons/BaseStore'

class MapTrackStore extends Store

  @storeName: 'MapTrackStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @init()

  init: ->
    @tracking = false

  trackMapForUserStarted: ->
    if !@tracking
      @tracking = true
      @emitChange()

  trackMapForUserEnded: ->
    @tracking = false
    @emitChange()

  getMapTrackState: ->
    return @tracking

  @handlers:
    "TrackMapForUserStarted": 'trackMapForUserStarted'
    "TrackMapForUserEnded": 'trackMapForUserEnded'

module.exports = MapTrackStore
