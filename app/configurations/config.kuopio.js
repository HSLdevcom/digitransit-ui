/* eslint-disable */
import mergeWith from 'lodash/mergeWith';

const CONFIG = process.env.CONFIG || 'kuopio';
const APP_TITLE = 'reittiopas.kuopio.fi';
const APP_DESCRIPTION = 'Kuopion uusi reittiopas';

const walttiConfig = require('./waltti').default;

export default mergeWith({}, walttiConfig, {
  CONFIG,

  appBarLink: { name: 'Kuopio', href: 'http://joukkoliikenne.kuopio.fi/' },

  colors: {
    primary: '#0077C9',
  },

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
  },

  title: APP_TITLE,

  textLogo: true, // title text instead of logo img

  favicon: './sass/themes/kuopio/favicon.png',

  feedIds: ['Kuopio', 'KuopioEly'],

  searchParams: {
    'boundary.rect.min_lat': 62.454915,
    'boundary.rect.max_lat': 63.469325,
    'boundary.rect.min_lon': 26.163918,
    'boundary.rect.max_lon': 29.013261
  },

  areaPolygon: [[26.163918, 62.454915], [26.163918, 63.469325], [29.013261, 63.469325], [29.013261, 62.454915]],

  defaultEndpoint: {
    address: 'Kuopion tori',
    lat: 62.892511,
    lon: 27.678136
  },

  defaultOrigins: [
    { icon: 'icon-icon_bus', label: 'Linja-autoasema', lat: 62.898516, lon: 27.679409 },
    { icon: 'icon-icon_rail', label: 'Rautatieasema', lat: 62.896875, lon: 27.680523 },
    { icon: 'icon-icon_school', label: 'Itä-Suomen yliopisto', lat: 62.894982, lon: 27.640932 },
  ],

  footer: {
    content: [
      { label: (function () { return `© Kuopio ${(1900 + new Date().getYear())}`; }()) },
      {},
      { name: 'footer-feedback', nameEn: 'Send feedback', type: 'feedback', icon: 'icon-icon_speech-bubble' },
      { name: 'about-this-service', nameEn: 'About this service', route: '/tietoja-palvelusta', icon: 'icon-icon_info' },
    ],
  },

  aboutThisService: {
    fi: {
      about: 'Tämän palvelun tarjoaa Kuopion seudun joukkoliikenne reittisuunnittelua varten Kuopion ja Siilinjärven alueella. Palvelu kattaa joukkoliikenteen, kävelyn, pyöräilyn ja yksityisautoilun rajatuilta osin. Palvelu perustuu Digitransit palvelualustaan.',
      digitransit: 'Digitransit palvelualusta on HSL:n ja Liikenneviraston kehittämä avoimen lähdekoodin reititystuote. Lähdekoodi tarjotaan EUPL v1.2 ja AGPLv3 lisensseillä.',
      datasources: 'Kartat, kadut, rakennukset, pysäkkisijainnit ym. tiedot tarjoaa © OpenStreetMap contributors ja ne ladataan Geofabrik palvelusta. Osoitetiedot tuodaan VRK:n rakennustietorekisteristä ja ne ladataan OpenAddresses-palvelusta. Joukkoliikenteen reitit ja aikataulut ladataan HSL:n dev.hsl.fi/gtfs palvelimelta.',
    },

    sv: {
      about: 'This is a test service for Kuopio area route planning. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
      digitransit: 'Digitransit service platform is created by HSL Finnish Transport Agency. The source code of the platform is dual-licensed under the EUPL v1.2 and AGPLv3 licenses.',
      datasources: "Maps, streets, buildings, stop locations etc. from © OpenStreetMap contributors downloaded from Geofabrik. Additional address data from Finland's Population Register Centre downloaded from OpenAddresses Public transport routes and timetables from HSL downloaded from dev.hsl.fi/gtfs.",
    },

    en: {
      about: 'This is a test service for Kuopio area route planning. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform. The service covers public transport, walking, cycling, and some private car use. Service is built on Digitransit platform.',
      digitransit: 'Digitransit service platform is created by HSL Finnish Transport Agency. The source code of the platform is dual-licensed under the EUPL v1.2 and AGPLv3 licenses.',
      datasources: "Maps, streets, buildings, stop locations etc. from © OpenStreetMap contributors downloaded from Geofabrik. Additional address data from Finland's Population Register Centre downloaded from OpenAddresses Public transport routes and timetables from HSL downloaded from dev.hsl.fi/gtfs.",
    },
  },

}, (objValue, srcValue) => {
  if (Array.isArray(srcValue)) { return srcValue; }
  if (Array.isArray(objValue)) { return objValue; }
  return undefined; // default merge
});
