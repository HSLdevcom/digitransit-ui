xhrPromise = require '../util/xhr-promise'

module.exports = nearestStopsRequest: (actionContext, coordinates, done) ->
    if coordinates
      xhrPromise.getJson("http://matka.hsl.fi/otp/routers/finland" + "/index/stops",
        lat: coordinates.lat
        lon: coordinates.lon
        radius: 1000
      ).then (data) ->
        actionContext.dispatch "NearestStopsFound", data
        done()