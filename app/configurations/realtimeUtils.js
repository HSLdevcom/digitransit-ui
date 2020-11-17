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
  return (
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
    '/#'
  );
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
      return (
        '/hfp/v2/journey/ongoing/+/+/+/+/' +
        route +
        '/' +
        direction +
        '/+/' +
        tripStartTime +
        '/#'
      );
    },

    mqtt: 'wss://mqtt.hsl.fi',

    gtfsrt: false,

    routeSelector: defaultRouteSelector,

    active: true,
  },
  tampere: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.waltti.fi/mqtt',

    credentials: { username: 'user', password: 'userpass' },

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,
  },
  LINKKI: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.waltti.fi/mqtt',

    credentials: { username: 'user', password: 'userpass' },

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,
  },
  Lappeenranta: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.waltti.fi/mqtt',

    credentials: { username: 'user', password: 'userpass' },

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,
  },
  Joensuu: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.waltti.fi/mqtt',

    credentials: { username: 'user', password: 'userpass' },

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,
  },
  Kuopio: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.waltti.fi/mqtt',

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
      return (
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
        '/#'
      );
    },

    mqtt: 'wss://mqtt.waltti.fi/mqtt',

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
      return (
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
        '/#'
      );
    },

    mqtt: 'wss://mqtt.waltti.fi/mqtt',

    credentials: { username: 'user', password: 'userpass' },

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,
  },
  Hameenlinna: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.waltti.fi/mqtt',

    credentials: { username: 'user', password: 'userpass' },

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,
  },
  Lahti: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.waltti.fi/mqtt',

    credentials: { username: 'user', password: 'userpass' },

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,
  },
};
