Dispatcher    = require '../dispatcher/dispatcher.coffee'
$             = require 'jquery'

class NearestStopsActions

  nearestStopsRequest: (coordinates) ->
    if coordinates
      $.getJSON "http://matka.hsl.fi/otp/routers/finland" + "/index/stops",
        lat: coordinates.lat
        lon: coordinates.lon
        radius: 1000
      , (data) ->
        Dispatcher.dispatch
          actionType: "NearestStopsFound"
          nearestStops: data


module.exports = new NearestStopsActions