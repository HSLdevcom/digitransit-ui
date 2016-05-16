config = require '../config'
moment = require 'moment'
xhrPromise = require '../util/xhr-promise'

# getTopic
# Returns MQTT topic to be subscribed
# Input: options - route, direction, tripStartTime are used to generate the topic
getTopic = (options) ->
  route = if options.route then options.route else "+"
  direction = if options.direction then parseInt(options.direction) + 1  else "+"
  tripStartTime = if options.tripStartTime then options.tripStartTime else "+"
  "/hfp/journey/+/+/#{route}/#{direction}/+/#{tripStartTime}/#"

parseMessage = (topic, message, actionContext) ->
  [_, _, _, mode, id, line, dir, headsign, start_time, next_stop, geohash...] = topic.split '/'
  if message instanceof Uint8Array
    parsedMessage = JSON.parse(message).VP
    # fix oday format
    parsedMessage.oday = parsedMessage.oday.replace(/-/g, "")
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
    stop_index: parsedMessage.stop_index
    timestamp: parsedMessage.tsi
    lat: parsedMessage.lat
    long: parsedMessage.long
    heading: parsedMessage.hdg
  actionContext.dispatch "RealTimeClientMessage",
    id: id
    message: messageContents

module.exports.startRealTimeClient = (actionContext, options, done) ->
  #Fetch initial data
  if !Array.isArray(options)
    options = [options]
  topics = (getTopic(option) for option in options)
  for topic in topics
    xhrPromise.getJson(config.URL.REALTIME + topic.replace('#', '')).then (data) ->
      parseMessage(resTopic, message, actionContext) for resTopic, message of data
  require.ensure ['mqtt'], ->
    mqtt = require 'mqtt'
    client = mqtt.connect config.URL.MQTT
    client.on 'connect', =>
      client.subscribe topics
    client.on 'message', (topic, message) -> parseMessage(topic, message, actionContext)
    actionContext.dispatch "RealTimeClientStarted",
      client: client
      topics: topics
    done()
  , 'mqtt'

module.exports.updateTopic = (actionContext, options, done) ->
  options.client.unsubscribe(options.oldTopics)
  if !Array.isArray(options.newTopic)
    options.newTopic = [options.newTopic]
  newTopics = (getTopic(option) for option in options.newTopic)
  options.client.subscribe(newTopics)
  actionContext.dispatch "RealTimeClientTopicChanged", newTopics
  # Do the loading of initial data after clearing the vehicles object
  for topic in newTopics
    xhrPromise.getJson(config.URL.REALTIME + topic.replace('#', '')).then (data) ->
      parseMessage(resTopic, message, actionContext) for resTopic, message of data
  done()

module.exports.stopRealTimeClient = (actionContext, client, done) ->
  client.end()
  actionContext.dispatch "RealTimeClientStopped"
  done()
