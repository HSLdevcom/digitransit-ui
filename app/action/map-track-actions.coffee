config     = require '../config'

startMapTrack = (actionContext, payload, done) ->
  actionContext.dispatch "TrackMapForUserStarted"
  done()

endMapTrack = (actionContext, payload, done) ->
  actionContext.dispatch "TrackMapForUserEnded"

module.exports =
  'startMapTrack': startMapTrack
  'endMapTrack': endMapTrack
