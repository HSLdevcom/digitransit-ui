import ceil from 'lodash/ceil';
import flatten from 'lodash/flatten';
import moment from 'moment';
import { parseFeedMQTT } from './gtfsRtParser';

const modeTranslate = {
  train: 'rail',
  metro: 'subway',
};

// getTopics
// Returns MQTT topics to be subscribed to
// Input: options - route, direction, tripStartTime are used to generate the topics
function getTopics(options, settings) {
  const route = options.route ? options.route : '+';
  const direction = options.direction
    ? parseInt(options.direction, 10) + 1
    : '+';
  const geoHash = options.geoHash ? options.geoHash : ['+', '+', '+', '+'];
  const tripId = options.tripId ? options.tripId : '+';
  const headsign = options.headsign ? options.headsign : '+';
  const tripStartTime = options.tripStartTime ? options.tripStartTime : '+';
  const topics = settings.mqttTopicResolver(
    route,
    direction,
    tripStartTime,
    headsign,
    settings.agency,
    tripId,
    geoHash,
  );
  return topics;
}

export function parseMessage(topic, message, agency) {
  let parsedMessage;
  const [
    ,
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
    ...rest // eslint-disable-line no-unused-vars
  ] = topic.split('/');

  const vehid = `${agency}_${id}`;
  if (message instanceof Uint8Array) {
    parsedMessage = JSON.parse(message).VP;
  } else {
    parsedMessage = message.VP;
  }

  if (
    line &&
    parsedMessage &&
    parsedMessage.lat &&
    parsedMessage.long &&
    (parsedMessage.seq === undefined || parsedMessage.seq === 1) // seq is used for hsl metro carriage sequence
  ) {
    let parsedLine;
    // remove possible variation from line id, for example '1010H1' -> '1010H' and '1010 1' -> '1010'
    if (line.length === 6) {
      parsedLine = line.charAt(4).match(/[A-Z]/i)
        ? line.substring(0, line.length - 1)
        : line.substring(0, line.length - 2);
    } else {
      parsedLine = line;
    }
    return {
      id: vehid,
      route: `${agency}:${parsedLine}`,
      direction: parseInt(dir, 10) - 1,
      tripStartTime: startTime.replace(/:/g, ''),
      operatingDay:
        parsedMessage.oday && parsedMessage.oday !== 'XXX'
          ? parsedMessage.oday
          : moment().format('YYYY-MM-DD'),
      mode: modeTranslate[mode] ? modeTranslate[mode] : mode,
      next_stop: `${agency}:${nextStop}`,
      timestamp: parsedMessage.tsi,
      lat: ceil(parsedMessage.lat, 5),
      long: ceil(parsedMessage.long, 5),
      heading: parsedMessage.hdg,
      headsign: undefined, // in HSL data headsign from realtime data does not always match gtfs data
    };
  }
  return undefined;
}

export function changeTopics(settings, actionContext) {
  const { client, oldTopics } = settings;

  if (Array.isArray(oldTopics) && oldTopics.length > 0) {
    client.unsubscribe(oldTopics);
  }
  const topics = flatten(
    settings.options.map(option => getTopics(option, settings)),
  );
  // set new topic to store
  actionContext.dispatch('RealTimeClientNewTopics', topics);
  client.subscribe(topics);
}

export function startMqttClient(settings, actionContext) {
  const options = settings.options || [{}];
  const topics = flatten(options.map(option => getTopics(option, settings)));
  const mode = options.length && options[0].mode ? options[0].mode : 'bus';

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
