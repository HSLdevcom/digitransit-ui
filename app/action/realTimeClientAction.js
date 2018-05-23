import moment from 'moment';

const modeTranslate = {
  train: 'rail',
};

// getTopic
// Returns MQTT topic to be subscribed
// Input: options - route, direction, tripStartTime are used to generate the topic
function getTopic(options) {
  const route = options.route ? options.route : '+';

  const direction = options.direction
    ? parseInt(options.direction, 10) + 1
    : '+';

  const tripStartTime = options.tripStartTime ? options.tripStartTime : '+';
  return `/hfp/v1/journey/ongoing/+/+/+/${route}/${direction}/+/${tripStartTime}/#`;
}

function parseMessage(topic, message, actionContext) {
  let parsedMessage;
  const [
    ,
    ,
    ,
    ,
    ,
    mode,
    agency,
    id,
    line,
    dir,
    headsign, // eslint-disable-line no-unused-vars
    startTime,
    nextStop,
    ...geohash // eslint-disable-line no-unused-vars
  ] = topic.split('/');

  const vehid = `${agency}_${id}`;

  if (message instanceof Uint8Array) {
    parsedMessage = JSON.parse(message).VP;
  } else {
    parsedMessage = message.VP;
  }

  const messageContents = {
    id: vehid,
    route: `HSL:${line}`,
    direction: parseInt(dir, 10) - 1,
    tripStartTime: startTime.replace(/:/g, ''),
    operatingDay:
      parsedMessage.oday && parsedMessage.oday !== 'XXX'
        ? parsedMessage.oday
        : moment().format('YYYYMMDD'),
    mode: modeTranslate[mode] ? modeTranslate[mode] : mode,
    delay: parsedMessage.dl,
    next_stop: nextStop,
    stop_index: parsedMessage.stop_index,
    timestamp: parsedMessage.tsi,
    lat: parsedMessage.lat && parsedMessage.lat.toFixed(5),
    long: parsedMessage.long && parsedMessage.long.toFixed(5),
    heading: parsedMessage.hdg,
  };

  actionContext.dispatch('RealTimeClientMessage', {
    id,
    message: messageContents,
  });
}

export function startRealTimeClient(actionContext, originalOptions, done) {
  const options = !Array.isArray(originalOptions)
    ? [originalOptions]
    : originalOptions;

  const topics = options.map(option => getTopic(option));

  import(/* webpackChunkName: "mqtt" */ 'mqtt').then(mqtt => {
    const client = mqtt.default.connect(actionContext.config.URL.MQTT);
    client.on('connect', () => client.subscribe(topics));
    client.on('message', (topic, message) =>
      parseMessage(topic, message, actionContext),
    );
    actionContext.dispatch('RealTimeClientStarted', { client, topics });
    done();
  });
}

export function updateTopic(actionContext, options, done) {
  options.client.unsubscribe(options.oldTopics);

  const newTopics = !Array.isArray(options.newTopic)
    ? [getTopic(options.newTopic)]
    : options.newTopic.map(topic => getTopic(topic));

  options.client.subscribe(newTopics);
  actionContext.dispatch('RealTimeClientTopicChanged', newTopics);

  done();
}

export function stopRealTimeClient(actionContext, client, done) {
  client.end();
  actionContext.dispatch('RealTimeClientStopped');
  done();
}
