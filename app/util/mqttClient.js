import ceil from 'lodash/ceil';
import moment from 'moment';
import { parseFeedMQTT } from './gtfsRtParser';

const standardModes = ['bus', 'tram', 'ferry'];

const getMode = mode => {
  if (standardModes.includes(mode)) {
    return mode;
  }
  if (mode === 'train') {
    return 'rail';
  }
  if (mode === 'metro') {
    return 'subway';
  }
  // bus mode should be used as fallback if mode is not one of the standard modes
  return 'bus';
};

// getTopic
// Returns a MQTT topic to be subscribed to
// Input: options - route, direction, tripStartTime are used to generate the topic
function getTopic(options, settings) {
  const route = options.route ? options.route : '+';
  const direction = options.direction
    ? parseInt(options.direction, 10) + 1
    : '+';
  const geoHash = options.geoHash ? options.geoHash : ['+', '+', '+', '+'];
  const tripId = options.tripId ? options.tripId : '+';
  // headsigns with / cause problems
  const headsign =
    options.headsign && options.headsign.indexOf('/') === -1
      ? options.headsign
      : '+';
  const tripStartTime = options.tripStartTime ? options.tripStartTime : '+';
  const topic = settings.mqttTopicResolver(
    route,
    direction,
    tripStartTime,
    headsign,
    settings.topicFeedId || settings.agency, // TODO topicFeedId can be removed once testing with alternative tampere trams is done
    tripId,
    geoHash,
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
    parsedMessage &&
    parsedMessage.lat &&
    parsedMessage.long &&
    (parsedMessage.seq === undefined || parsedMessage.seq === 1) // seq is used for hsl metro carriage sequence
  ) {
    return {
      id: vehid,
      route: `${agency}:${line}`,
      direction: parseInt(dir, 10) - 1,
      tripStartTime: startTime.replace(/:/g, ''),
      operatingDay:
        parsedMessage.oday && parsedMessage.oday !== 'XXX'
          ? parsedMessage.oday
          : moment().format('YYYY-MM-DD'),
      mode: getMode(mode),
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
  const topics = settings.options.map(option => getTopic(option, settings));
  // set new topic to store
  actionContext.dispatch('RealTimeClientNewTopics', topics);
  client.subscribe(topics);
}

export function startMqttClient(settings, actionContext) {
  const options = settings.options || [{}];
  const topics = options.map(option => getTopic(option, settings));

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
