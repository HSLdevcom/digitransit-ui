xhrPromise = require '../util/xhr-promise'

module.exports = 
  nearestStopsRequest: (actionContext, coordinates, done) ->
    if coordinates
      xhrPromise.getJson("http://matka.hsl.fi/otp/routers/finland" + "/index/stops",
        lat: coordinates.lat
        lon: coordinates.lon
        radius: 1000
      ).then (data) ->
        actionContext.dispatch "NearestStopsFound", data
        done()
  stopsInRectangleRequest: (actionContext, coordinates, done) ->
    if coordinates
      xhrPromise.getJson("http://matka.hsl.fi/otp/routers/finland" + "/index/stops",
        maxLat: coordinates.maxLat
        maxLon: coordinates.maxLon
        minLat: coordinates.minLat
        minLon: coordinates.minLon
      ).then (data) ->
        actionContext.dispatch "StopsInRectangleFound", data
        done()