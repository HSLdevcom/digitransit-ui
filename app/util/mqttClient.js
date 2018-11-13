import ceil from 'lodash/ceil';
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
        : moment().format('YYYY-MM-DD'),
    mode: modeTranslate[mode] ? modeTranslate[mode] : mode,
    next_stop: nextStop,
    timestamp: parsedMessage.tsi,
    lat: parsedMessage.lat && ceil(parsedMessage.lat, 5),
    long: parsedMessage.long && ceil(parsedMessage.long, 5),
    heading: parsedMessage.hdg,
  };

  actionContext.dispatch('RealTimeClientMessage', {
    id,
    message: messageContents,
  });
}

export default function startMqttClient(url, options, actionContext) {
  const topics = options.map(option => getTopic(option));

  return import(/* webpackChunkName: "mqtt" */ 'mqtt').then(mqtt => {
    const client = mqtt.default.connect(actionContext.config.URL.MQTT);
    client.on('connect', () => client.subscribe(topics));
    client.on('message', (topic, message) =>
      parseMessage(topic, message, actionContext),
    );
    return { client, topics };
  });
}
