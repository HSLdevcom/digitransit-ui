/* eslint-disable prefer-template */
export default {
  HSL: {
    mqttTopicResolver: function mqttTopicResolver(
      route,
      direction,
      tripStartTime,
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
  },
  /*
  tampere: {
    mqttTopicResolver: function mqttTopicResolver(
      route,
      direction,
      tripStartTime,
    ) {
      return (
        '/gtfsrt/vp/tampere/+/+/+/' +
        route +
        '/' +
        direction +
        '/+/+/' +
        tripStartTime +
        '/#'
      );
    },

    mqtt: 'ws://51.144.32.81:8083/mqtt',

    gtfsrt: true,

    routeSelector: function selectRoute(routePageProps) {
      const route = routePageProps.route.gtfsId.split(':');
      return route[1];
    },
  },
*/
};
