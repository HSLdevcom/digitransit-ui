/* eslint-disable prefer-template */
function defaultRouteSelector(routePageProps) {
  const route = routePageProps.route.gtfsId.split(':');
  return route[1];
}

function defaulVehicleNumberParser(vehicleNumber) {
  return vehicleNumber;
}

function vehicleNumberPartParser(vehicleNumber) {
  return vehicleNumber.indexOf(' ') !== -1
    ? vehicleNumber.split(' ')[1]
    : vehicleNumber;
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

function elyTopicResolver(
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
    '/+/+/' +
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

function noHeadsignTopicResolver(
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
}

function tripRouteTopicResolver(
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
}

function routeTopicResolver(
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
    '/+/+/+/+/+/+/+/' +
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

function hslTopicResolver(
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
}

const mqttAddress =
  process.env.RUN_ENV === 'development' || process.env.NODE_ENV !== 'production'
    ? 'wss://dev-mqtt.digitransit.fi'
    : 'wss://mqtt.digitransit.fi';

const baseMqtt = {
  mqtt: mqttAddress,
  routeSelector: defaultRouteSelector,
  active: true,
  vehicleNumberParser: defaulVehicleNumberParser,
};

const walttiMqtt = {
  ...baseMqtt,
  gtfsrt: true,
  mqttTopicResolver: walttiTopicResolver,
};

function elyMqtt(ignoreHeadsign) {
  return {
    ...walttiMqtt,
    mqttTopicResolver: elyTopicResolver,
    ignoreHeadsign,
  };
}

export default {
  HSL: {
    ...baseMqtt,
    mqtt: 'wss://mqtt.hsl.fi',
    mqttTopicResolver: hslTopicResolver,
    gtfsrt: false,
  },
  tampere: walttiMqtt,
  LINKKI: walttiMqtt,
  Lappeenranta: walttiMqtt,
  Joensuu: walttiMqtt,
  Kuopio: walttiMqtt,
  OULU: walttiMqtt,
  Hameenlinna: walttiMqtt,
  Lahti: walttiMqtt,
  Vaasa: walttiMqtt,
  Mikkeli: walttiMqtt,
  Salo: walttiMqtt,
  Kouvola: walttiMqtt,
  Kotka: walttiMqtt,
  Rovaniemi: walttiMqtt,
  Kajaani: walttiMqtt,
  Rauma: walttiMqtt,
  Pori: walttiMqtt,
  VARELY: walttiMqtt,
  PohjolanMatka: elyMqtt(true),
  Harma: elyMqtt(false),
  Korsisaari: elyMqtt(true),
  KoivistonAuto: elyMqtt(true),
  PahkakankaanLiikenne: elyMqtt(true),
  IngvesSvanback: elyMqtt(true),
  FOLI: { ...walttiMqtt, mqttTopicResolver: noHeadsignTopicResolver },
  MATKA: {
    ...walttiMqtt,
    mqttTopicResolver: routeTopicResolver,
    vehicleNumberParser: vehicleNumberPartParser,
  },
  digitraffic: {
    ...walttiMqtt,
    mqttTopicResolver: tripRouteTopicResolver,
    vehicleNumberParser: vehicleNumberPartParser,
  },
};
