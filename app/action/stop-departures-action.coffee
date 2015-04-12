Dispatcher    = require '../dispatcher/dispatcher.coffee'
$             = require 'jquery'

class StopDeparturesActions

  stopDeparturesRequest: (id) ->
    if id
      $.getJSON "http://matka.hsl.fi/otp/routers/finland" + "/index/stops/" + id + "/stoptimes?detail=true", (data) ->
        Dispatcher.dispatch
          actionType: "StopDeparturesFound"
          id: id
          stopDepartures: data


module.exports = new StopDeparturesActions