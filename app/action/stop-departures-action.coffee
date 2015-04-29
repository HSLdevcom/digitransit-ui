$             = require 'jquery'

module.exports = stopDeparturesRequest: (actionContext, id, done) ->
    if id
      $.getJSON "http://matka.hsl.fi/otp/routers/finland" + "/index/stops/" + id + "/stoptimes?detail=true", (data) ->
        actionContext.dispatch "StopDeparturesFound",
          id: id
          departures: data