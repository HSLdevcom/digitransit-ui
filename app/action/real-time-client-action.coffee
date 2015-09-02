config = require '../config'
moment = require 'moment'
xhrPromise = require '../util/xhr-promise'


getTopic = (options) ->
  route = if options.route then options.route else "+"
  direction = if options.direction then parseInt(options.direction) + 1  else "+"
  '/hfp/journey/+/+/' + route + '/' + direction + '/#'

parseMessage = (topic, message, actionContext) ->
  [_, _, _, mode, id, line, dir, headsign, start_time, next_stop, geohash...] = topic.split '/'
  if message instanceof Uint8Array
    parsedMessage = JSON.parse(message).VP
  else
    parsedMessage = message.VP
  messageContents =
    id: id
    route: "HSL:" + line
    direction: parseInt(dir) - 1
    tripStartTime: start_time
    operatingDay:
      if parsedMessage.oday != "XXX"
        parsedMessage.oday
      else
        moment().format("YYYYMMDD")
    mode: mode
    delay: parsedMessage.dl
    next_stop: next_stop
    timestamp: parsedMessage.tsi
    lat: parsedMessage.lat
    long: parsedMessage.long
  actionContext.dispatch "RealTimeClientMessage",
    id: id
    message: messageContents

module.exports =
  startRealTimeClient: (actionContext, options, done) ->
    #Fetch initial data
    xhrPromise.getJson(config.URL.REALTIME + (getTopic(options)).replace('#', '')).then (data) ->
      parseMessage(topic, message, actionContext) for topic, message of data
    require.ensure ['mqtt'], ->
      mqtt = require 'mqtt'
      client = mqtt.connect config.URL.MQTT
      client.on 'connect', =>
        client.subscribe getTopic(options)
      client.on 'message', (topic, message) -> parseMessage(topic, message, actionContext)
      actionContext.dispatch "RealTimeClientStarted",
        client: client
        topics: [getTopic(options)]
      done()
    , 'mqtt'

  updateTopic: (actionContext, options, done) ->
    options.client.unsubscribe(options.oldTopics)
    newTopic = getTopic(options.newTopic)
    options.client.subscribe(newTopic)
    actionContext.dispatch "RealTimeClientTopicChanged", [newTopic]
    # Do the loading of initial data after clearing the vehicles object
    xhrPromise.getJson(config.URL.REALTIME + newTopic.replace('#', '')).then (data) ->
      parseMessage(topic, message, actionContext) for topic, message of data
    done()

  stopRealTimeClient: (actionContext, client, done) ->
    client.end()
    actionContext.dispatch "RealTimeClientStopped"
    done()
