config = require '../config'
Pbf = require 'pbf'
GtfsRt = require '../util/gtfs-rt'

module.exports = getDisruptions: (actionContext) ->
  if config.URL.ALERTS
    fetch(config.URL.ALERTS).then((res) ->
      res.arrayBuffer().then((buf) ->
        actionContext.dispatch "UpdateDisruptions", GtfsRt.read(new Pbf(buf))
      )
    )
