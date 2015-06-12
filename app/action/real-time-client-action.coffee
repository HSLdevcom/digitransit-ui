mqtt = if window? then require 'mqtt' else null
config = require '../config'

module.exports = 
  startRealTimeClient: (actionContext, options, done) ->
    client = mqtt.connect config.URL.MQTT
    route = if options.route then options.route else "+"
    direction = if options.direction then parseInt(options.direction) + 1  else "+"

    client.on 'connect', =>
      client.subscribe('/hfp/journey/+/+/' + route + '/' + direction + '/#')
    client.on 'message', (topic, message) =>
      actionContext.dispatch "RealTimeClientMessage", 
        topic: topic
        message: message
    actionContext.dispatch "RealTimeClientStarted", client
    done()
  stopRealTimeClient: (actionContext, client, done) ->
    client.end()
    actionContext.dispatch "RealTimeClientStopped"
    done()
