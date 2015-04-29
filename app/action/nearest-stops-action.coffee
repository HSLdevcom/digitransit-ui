$             = require 'jquery'

module.exports = nearestStopsRequest: (actionContext, coordinates, done) ->
    if coordinates
      $.getJSON "http://matka.hsl.fi/otp/routers/finland" + "/index/stops",
        lat: coordinates.lat
        lon: coordinates.lon
        radius: 1000
      , (data) ->
        actionContext.dispatch "NearestStopsFound", data
        done()