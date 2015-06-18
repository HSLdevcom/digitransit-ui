config = require '../config'
RouteInformationAction = require './route-information-action'
moment = require 'moment'

getTopic = (options) ->
  route = if options.route then options.route else "+"
  direction = if options.direction then parseInt(options.direction) + 1  else "+"
  '/hfp/journey/+/+/' + route + '/' + direction + '/#'

module.exports = 
  startRealTimeClient: (actionContext, options, done) ->
    require.ensure ['mqtt'], ->
      mqtt = require 'mqtt'
      client = mqtt.connect config.URL.MQTT
      client.on 'connect', =>
        client.subscribe(getTopic(options))
      client.on 'message', (topic, message) =>
        [_, _, _, mode, id, line, dir, headsign, start_time, next_stop, geohash...] = topic.split '/'
        parsedMessage = JSON.parse(message).VP
        messageContents =
          id: id
          route: "HSL:" + line
          direction: parseInt(dir) - 1
          tripStartTime: start_time
          operatingDay: if parsedMessage.oday != "XXX" then parsedMessage.oday else moment().format("YYYYMMDD")
          mode: mode
          delay: parsedMessage.dl
          next_stop: next_stop
          timestamp: parsedMessage.tsi
          lat: parsedMessage.lat
          long: parsedMessage.long
        details = # Used for fuzzy trip id matching
          route: messageContents.route
          date: messageContents.operatingDay
          direction: messageContents.direction
          trip: messageContents.tripStartTime
        actionContext.executeAction RouteInformationAction.fuzzyTripInformationRequest, details, ->
          messageContents.trip = actionContext.getStore('RouteInformationStore').getFuzzyTrip(details)
          actionContext.executeAction RouteInformationAction.patternInformationRequest, messageContents.trip.pattern.id, ->
            actionContext.dispatch "RealTimeClientMessage",
              id: id
              message: messageContents
      actionContext.dispatch "RealTimeClientStarted",
        client: client
        topics: [getTopic(options)]
      done()

  updateTopic: (actionContext, options, done) ->
    options.client.unsubscribe(options.oldTopics)
    newTopic = getTopic(options.newTopic)
    options.client.subscribe(newTopic)
    actionContext.dispatch "RealTimeClientTopicChanged", [newTopic]

  stopRealTimeClient: (actionContext, client, done) ->
    client.end()
    actionContext.dispatch "RealTimeClientStopped"
    done()
