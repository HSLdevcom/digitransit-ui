import moment from 'moment';
import { getJson } from '../util/xhrPromise';

// getTopic
// Returns MQTT topic to be subscribed
// Input: options - route, direction, tripStartTime are used to generate the topic
function getTopic(options) {
  const route = options.route ? options.route : '+';

  const direction = options.direction ? parseInt(options.direction, 10) + 1 : '+';

  const tripStartTime = options.tripStartTime ? options.tripStartTime : '+';
  return `/hfp/journey/+/+/${route}/${direction}/+/${tripStartTime}/#`;
}

function parseMessage(topic, message, actionContext) {
  let parsedMessage;
  const [, , , mode, id, line, dir, /* headsign*/ , startTime, nextStop] /* ...geohash */
    = topic.split('/');

  if (message instanceof Uint8Array) {
    parsedMessage = JSON.parse(message).VP;
    // fix oday format
    parsedMessage.oday = parsedMessage.oday && parsedMessage.oday.replace(/-/g, '');
  } else {
    parsedMessage = message.VP;
  }

  const messageContents = {
    id,
    route: `HSL:${line}`,
    direction: parseInt(dir, 10) - 1,
    tripStartTime: startTime,
    operatingDay: parsedMessage.oday && parsedMessage.oday !== 'XXX' ? parsedMessage.oday :
      moment().format('YYYYMMDD'),
    mode,
    delay: parsedMessage.dl,
    next_stop: nextStop,
    stop_index: parsedMessage.stop_index,
    timestamp: parsedMessage.tsi,
    lat: parsedMessage.lat,
    long: parsedMessage.long,
    heading: parsedMessage.hdg,
  };

  actionContext.dispatch('RealTimeClientMessage', { id, message: messageContents });
}

function getInitialData(topic, actionContext) {
  getJson(actionContext.config.URL.REALTIME + topic.replace('#', '')).then((data) => {
    Object.keys(data).forEach((resTopic) => {
      parseMessage(resTopic, data[resTopic], actionContext);
    });
  });
}

export function startRealTimeClient(actionContext, originalOptions, done) {
  const options = !Array.isArray(originalOptions) ? [originalOptions] : originalOptions;

  const topics = options.map(option => getTopic(option));

  topics.forEach(topic => getInitialData(topic, actionContext));

  System.import('mqtt').then((mqtt) => {
    const client = mqtt.connect(actionContext.config.URL.MQTT);
    client.on('connect', () => client.subscribe(topics));
    client.on('message', (topic, message) => parseMessage(topic, message, actionContext));
    actionContext.dispatch('RealTimeClientStarted', { client, topics });
    done();
  });
}

export function updateTopic(actionContext, options, done) {
  options.client.unsubscribe(options.oldTopics);

  const newTopics = !Array.isArray(options.newTopic) ? [getTopic(options.newTopic)] :
    options.newTopic.map(topic => getTopic(topic));

  options.client.subscribe(newTopics);
  actionContext.dispatch('RealTimeClientTopicChanged', newTopics);

  // Do the loading of initial data after clearing the vehicles object
  newTopics.forEach(topic => getInitialData(topic, actionContext));

  done();
}

export function stopRealTimeClient(actionContext, client, done) {
  client.end();
  actionContext.dispatch('RealTimeClientStopped');
  done();
}
