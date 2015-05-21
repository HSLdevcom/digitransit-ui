mqtt = if window? then require 'mqtt' else null

module.exports = 
  startRealTimeClient: (actionContext, options, done) ->
    client = mqtt.connect 'ws://213.138.147.225:1883'
    client.on 'connect', =>
      client.subscribe('/hfp/journey/#')
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
