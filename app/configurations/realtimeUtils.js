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
    '/+/+/' +
    tripStartTime +
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
    ) {
      return (
        '/hfp/v1/journey/ongoing/+/+/+/' +
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

    mqtt: 'wss://mqtt.lmj.fi:8084/mqtt',

    credentials: { username: 'user', password: 'userpass' },

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: false,
  },
  LINKKI: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.lmj.fi:8084/mqtt',

    credentials: { username: 'user', password: 'userpass' },

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: false,
  },
  Lappeenranta: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.lmj.fi:8084/mqtt',

    credentials: { username: 'user', password: 'userpass' },

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: false,
  },
  Joensuu: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.lmj.fi:8084/mqtt',

    credentials: { username: 'user', password: 'userpass' },

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: false,
  },
  Kuopio: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.lmj.fi:8084/mqtt',

    credentials: { username: 'user', password: 'userpass' },

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: false,
  },
};
