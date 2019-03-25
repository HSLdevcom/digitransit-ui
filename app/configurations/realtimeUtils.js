/* eslint-disable prefer-template */
export default {
  HSL: {
    mqttTopicResolver: function mqttTopicResolver(
      route,
      direction,
      tripStartTime,
      headsign, // eslint-disable-line no-unused-vars
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

    routeSelector: function selectRoute(routePageProps) {
      const route = routePageProps.route.gtfsId.split(':');
      return route[1];
    },

    active: true,
  },
  tampere: {
    mqttTopicResolver: function mqttTopicResolver(
      route,
      direction,
      tripStartTime,
      headsign,
    ) {
      return (
        '/gtfsrt/vp/tampere/+/+/+/' +
        route +
        '/' +
        direction +
        '/' +
        headsign +
        '/+/' +
        tripStartTime +
        '/#'
      );
    },

    mqtt: 'wss://lmj.mqtt.fi:8084/mqtt',

    credentials: { username: 'user', password: 'userpass' },

    gtfsrt: true,

    routeSelector: function selectRoute(routePageProps) {
      const route = routePageProps.route.gtfsId.split(':');
      return route[1];
    },

    active: false,
  },
  LINKKI: {
    mqttTopicResolver: function mqttTopicResolver(
      route,
      direction,
      tripStartTime,
      headsign,
    ) {
      return (
        '/gtfsrt/vp/LINKKI/+/+/+/' +
        route +
        '/' +
        direction +
        '/' +
        headsign +
        '/+/' +
        tripStartTime +
        '/#'
      );
    },

    mqtt: 'wss://lmj.mqtt.fi:8084/mqtt',

    credentials: { username: 'user', password: 'userpass' },

    gtfsrt: true,

    routeSelector: function selectRoute(routePageProps) {
      const route = routePageProps.route.gtfsId.split(':');
      return route[1];
    },

    active: false,
  },
  Lappeenranta: {
    mqttTopicResolver: function mqttTopicResolver(
      route,
      direction,
      tripStartTime,
      headsign,
    ) {
      return (
        '/gtfsrt/vp/Lappeenranta/+/+/+/' +
        route +
        '/' +
        direction +
        '/' +
        headsign +
        '/+/' +
        tripStartTime +
        '/#'
      );
    },

    mqtt: 'wss://lmj.mqtt.fi:8084/mqtt',

    credentials: { username: 'user', password: 'userpass' },

    gtfsrt: true,

    routeSelector: function selectRoute(routePageProps) {
      const route = routePageProps.route.gtfsId.split(':');
      return route[1];
    },

    active: false,
  },
  Joensuu: {
    mqttTopicResolver: function mqttTopicResolver(
      route,
      direction,
      tripStartTime,
      headsign,
    ) {
      return (
        '/gtfsrt/vp/Joensuu/+/+/+/' +
        route +
        '/' +
        direction +
        '/' +
        headsign +
        '/+/' +
        tripStartTime +
        '/#'
      );
    },

    mqtt: 'wss://lmj.mqtt.fi:8084/mqtt',

    credentials: { username: 'user', password: 'userpass' },

    gtfsrt: true,

    routeSelector: function selectRoute(routePageProps) {
      const route = routePageProps.route.gtfsId.split(':');
      return route[1];
    },

    active: false,
  },
  Kuopio: {
    mqttTopicResolver: function mqttTopicResolver(
      route,
      direction,
      tripStartTime,
      headsign,
    ) {
      return (
        '/gtfsrt/vp/Kuopio/+/+/+/' +
        route +
        '/' +
        direction +
        '/' +
        headsign +
        '/+/' +
        tripStartTime +
        '/#'
      );
    },

    mqtt: 'wss://lmj.mqtt.fi:8084/mqtt',

    credentials: { username: 'user', password: 'userpass' },

    gtfsrt: true,

    routeSelector: function selectRoute(routePageProps) {
      const route = routePageProps.route.gtfsId.split(':');
      return route[1];
    },

    active: false,
  },
};
