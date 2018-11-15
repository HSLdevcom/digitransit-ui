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

export function parseMessage(topic, message, agency) {
  let parsedMessage;
  const [
    ,
    ,
    ,
    ,
    ,
    mode,
    ,
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

  return {
    id: vehid,
    route: `${agency}:${line}`,
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
}

export default function startMqttClient(settings, actionContext) {
  const topics = settings.options.map(option => getTopic(option));

  return import(/* webpackChunkName: "mqtt" */ 'mqtt').then(mqtt => {
    const client = mqtt.default.connect(settings.mqtt);
    client.on('connect', () => client.subscribe(topics));
    client.on('message', (topic, message) =>
      actionContext.dispatch(
        'RealTimeClientMessage',
        parseMessage(topic, message, settings.agency),
      ),
    );
    return { client, topics };
  });
}
