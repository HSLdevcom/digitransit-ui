/* eslint-disable prefer-template */
function defaultRouteSelector(routePageProps) {
  const route = routePageProps.route.gtfsId.split(':');
  return route[1];
}
function defaulVehicleNumberParser(vehicleNumber) {
  return vehicleNumber;
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
      hslDirection,
      tripStartTime,
      headsign, // eslint-disable-line no-unused-vars
      feedId, // eslint-disable-line no-unused-vars
      tripId, // eslint-disable-line no-unused-vars
      geoHash, // eslint-disable-line no-unused-vars
    ) {
      let direction = hslDirection;
      if (Number.isInteger(direction)) {
        direction += 1;
      }
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

    useFuzzyTripMatching: true, // DT-3473

    vehicleNumberParser: defaulVehicleNumberParser,
  },
  tampere: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.digitransit.fi',

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,

    vehicleNumberParser: defaulVehicleNumberParser,
  },
  LINKKI: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.digitransit.fi',

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,

    vehicleNumberParser: defaulVehicleNumberParser,
  },
  Lappeenranta: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.digitransit.fi',

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,

    vehicleNumberParser: defaulVehicleNumberParser,
  },
  Joensuu: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.digitransit.fi',

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,

    vehicleNumberParser: defaulVehicleNumberParser,
  },
  Kuopio: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.digitransit.fi',

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,

    vehicleNumberParser: defaulVehicleNumberParser,
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

    mqtt: 'wss://mqtt.digitransit.fi',

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,

    vehicleNumberParser: defaulVehicleNumberParser,
  },
  OULU: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.digitransit.fi',

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,

    vehicleNumberParser: defaulVehicleNumberParser,
  },
  Hameenlinna: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.digitransit.fi',

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,

    vehicleNumberParser: defaulVehicleNumberParser,
  },
  Lahti: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.digitransit.fi',

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,

    vehicleNumberParser: defaulVehicleNumberParser,
  },
  Vaasa: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.digitransit.fi',

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,

    vehicleNumberParser: defaulVehicleNumberParser,
  },
  Mikkeli: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.digitransit.fi',

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,

    vehicleNumberParser: defaulVehicleNumberParser,
  },
  Salo: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.digitransit.fi',

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,

    vehicleNumberParser: defaulVehicleNumberParser,
  },
  Kouvola: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.digitransit.fi',

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,

    vehicleNumberParser: defaulVehicleNumberParser,
  },
  Kotka: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.digitransit.fi',

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,

    vehicleNumberParser: defaulVehicleNumberParser,
  },
  Rovaniemi: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.digitransit.fi',

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,

    vehicleNumberParser: defaulVehicleNumberParser,
  },
  Kajaani: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.digitransit.fi',

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,

    vehicleNumberParser: defaulVehicleNumberParser,
  },
  Rauma: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.digitransit.fi',

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,

    vehicleNumberParser: defaulVehicleNumberParser,
  },
  Pori: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.digitransit.fi',

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,

    vehicleNumberParser: defaulVehicleNumberParser,
  },
  VARELY: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.digitransit.fi',

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,

    vehicleNumberParser: defaulVehicleNumberParser,
  },
  digitraffic: {
    mqttTopicResolver: walttiTopicResolver,

    mqtt: 'wss://mqtt.digitransit.fi',

    gtfsrt: true,

    routeSelector: defaultRouteSelector,

    active: true,

    vehicleNumberParser: function vehicleNumberParser(vehicleNumber) {
      return vehicleNumber.indexOf(' ') !== -1
        ? vehicleNumber.split(' ')[1]
        : vehicleNumber;
    },
  },
};
