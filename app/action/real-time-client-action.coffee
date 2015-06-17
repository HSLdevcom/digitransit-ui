config = require '../config'
RouteInformationAction = require './route-information-action'
moment = require 'moment'

module.exports = 
  startRealTimeClient: (actionContext, options, done) ->
    require.ensure ['mqtt'], ->
      mqtt = require 'mqtt'
      client = mqtt.connect config.URL.MQTT
      route = if options.route then options.route else "+"
      direction = if options.direction then parseInt(options.direction) + 1  else "+"

      client.on 'connect', =>
        client.subscribe('/hfp/journey/+/+/' + route + '/' + direction + '/#')
      client.on 'message', (topic, message) =>
        [_, _, _, mode, id, line, dir, headsign, start_time, next_stop, geohash...] = topic.split '/'
        messageContents = JSON.parse(message).VP
        messageContents.mode = mode
        messageContents.next_stop = next_stop
        actionContext.executeAction RouteInformationAction.fuzzyTripInformationRequest,
          route: "HSL:" + line
          date: moment().format("YYYYMMDD")
          direction: parseInt(dir) - 1
          trip: start_time
        actionContext.dispatch "RealTimeClientMessage", 
          id: id
          message: messageContents
      actionContext.dispatch "RealTimeClientStarted", client
      done()
  stopRealTimeClient: (actionContext, client, done) ->
    client.end()
    actionContext.dispatch "RealTimeClientStopped"
    done()
