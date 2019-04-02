import ceil from 'lodash/ceil';
import moment from 'moment';
import { parseFeedMQTT } from './gtfsRtParser';

const modeTranslate = {
  train: 'rail',
};

// getTopic
// Returns MQTT topic to be subscribed
// Input: options - route, direction, tripStartTime are used to generate the topic
function getTopic(options, settings) {
  const route = options.route ? options.route : '+';

  const direction = options.direction
    ? parseInt(options.direction, 10) + 1
    : '+';

  const tripStartTime = options.tripStartTime ? options.tripStartTime : '+';
  const topic = settings.mqttTopicResolver(
    route,
    direction,
    tripStartTime,
    options.headsign,
    settings.agency,
  );
  return topic;
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
    headsign: undefined, // in HSL data headsign from realtime data does not always match gtfs data
  };
}

export function changeTopics(settings, actionContext) {
  const { client, oldTopics } = settings;

  client.unsubscribe(oldTopics);
  // remove existing vehicles/topics
  actionContext.dispatch('RealTimeClientReset');
  const topic = getTopic(settings.options, settings);
  // set new topic to store
  actionContext.dispatch('RealTimeClientNewTopics', topic);
  client.subscribe(topic);
}

export function startMqttClient(settings, actionContext) {
  const topics = settings.options.map(option => getTopic(option, settings));
  const mode = settings.options.length !== 0 ? settings.options[0].mode : 'bus';

  return import(/* webpackChunkName: "mqtt" */ 'mqtt').then(mqtt => {
    if (settings.gtfsrt) {
      return import(/* webpackChunkName: "gtfsrt" */ './gtfsrt').then(
        bindings => {
          const feedReader = bindings.FeedMessage.read;
          const credentials =
            settings.credentials !== undefined ? settings.credentials : {};
          const client = mqtt.default.connect(settings.mqtt, credentials);
          client.on('connect', () => client.subscribe(topics));
          client.on('message', (topic, messages) => {
            const parsedMessages = parseFeedMQTT(
              feedReader,
              messages,
              topic,
              settings.agency,
              mode,
            );
            parsedMessages.forEach(message => {
              actionContext.dispatch('RealTimeClientMessage', message);
            });
          });
          return { client, topics };
        },
      );
    }
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
