/* eslint-disable prefer-template */

function defaultRouteSelector(routePageProps) {
  const route = routePageProps.route.gtfsId.split(':');
  return route[1];
}
function walttiTopicResolver(
  route,
  direction,
  tripStartTime,
  headsign,
  feedId,
  tripId,
  geoHash,
) {
  return [
    '/gtfsrt/vp/' +
      feedId +
      '/+/+/+/' +
      route +
      '/' +
      direction +
      '/' +
      headsign +
      '/' +
      tripId +
      '/+/' +
      tripStartTime +
      '/+/' +
      geoHash[0] +
      '/' +
      geoHash[1] +
      '/' +
      geoHash[2] +
      '/' +
      geoHash[3] +
      '/#',
  ];
}

export default {
  HSL: {
    mqttTopicResolver: function mqttTopicResolver(
      route,
      direction,
      tripStartTime,
      headsign, // eslint-disable-line no-unused-vars
      feedId, // eslint-disable-line no-unused-vars
      tripId, // eslint-disable-line no-unused-vars
      geoHash, // eslint-disable-line no-unused-vars
    ) {
      const topics = [];
      // add topic with normal route id, for example 1010
      const topicWithNormalRoute =
        '/hfp/v2/journey/ongoing/+/+/+/+/' +
        route +
        '/' +
        direction +
        '/+/' +
        tripStartTime +
        '/#';
      topics.push(topicWithNormalRoute);
      // add topics with routes with variation
      for (let i = 1; i < 10; i++) {
        // if the route id ends with a letter, 1010H for example,
        // then add topics with route ids '1010H1' ... '1010H9'
        // if the route id ends with a number, 1010 for example,
        // then add topics with route ids '1010 1' ... '1010 9'
        const routeWithVariation = route
          .charAt(route.length - 1)
          .match(/[A-Z]/i)
          ? route + i.toString()
          : route + ' ' + i.toString();
        const topic =
          '/hfp/v2/journey/ongoing/+/+/+/+/' +
          routeWithVariation +
          '/' +
          direction +
          '/+/' +
          tripStartTime +
          '/#';
        topics.push(topic);
      }
      return topics;
    },

    mqtt: 'wss://mqtt.hsl.fi',

    gtfsrt: false,

    routeSelector: defaultRouteSelector,

    active: true,
  },
  tampere: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.lmj.fi/mqtt',

    credentials: { username: 'user', password: 'userpass' },

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,
  },
  LINKKI: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.lmj.fi/mqtt',

    credentials: { username: 'user', password: 'userpass' },

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,
  },
  Lappeenranta: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.lmj.fi/mqtt',

    credentials: { username: 'user', password: 'userpass' },

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,
  },
  Joensuu: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.lmj.fi/mqtt',

    credentials: { username: 'user', password: 'userpass' },

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,
  },
  Kuopio: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.lmj.fi/mqtt',

    credentials: { username: 'user', password: 'userpass' },

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,
  },
  FOLI: {
    mqttTopicResolver: function mqttTopicResolver(
      route,
      direction,
      tripStartTime,
      headsign, // eslint-disable-line no-unused-vars
      feedId,
      tripId,
      geoHash,
    ) {
      return [
        '/gtfsrt/vp/' +
          feedId +
          '/+/+/+/' +
          route +
          '/' +
          direction +
          '/+/' +
          tripId +
          '/+/' +
          tripStartTime +
          '/+/' +
          geoHash[0] +
          '/' +
          geoHash[1] +
          '/' +
          geoHash[2] +
          '/' +
          geoHash[3] +
          '/#',
      ];
    },

    mqtt: 'wss://mqtt.lmj.fi/mqtt',

    credentials: { username: 'user', password: 'userpass' },

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,
  },
  OULU: {
    mqttTopicResolver: function mqttTopicResolver(
      route,
      direction, // eslint-disable-line no-unused-vars
      tripStartTime, // eslint-disable-line no-unused-vars
      headsign, // eslint-disable-line no-unused-vars
      feedId,
      tripId,
      geoHash,
    ) {
      return [
        '/gtfsrt/vp/' +
          feedId +
          '/+/+/+/' +
          route +
          '/+/+/' +
          tripId +
          '/+/+/+/' +
          geoHash[0] +
          '/' +
          geoHash[1] +
          '/' +
          geoHash[2] +
          '/' +
          geoHash[3] +
          '/#',
      ];
    },

    mqtt: 'wss://mqtt.lmj.fi/mqtt',

    credentials: { username: 'user', password: 'userpass' },

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,
  },
};
